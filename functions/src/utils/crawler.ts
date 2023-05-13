import { AnyNode, Cheerio, Document, load } from 'cheerio'
import superagent from 'superagent'
import invokeCFBypass from './invokeCFBypass'
import superagentCharset from 'superagent-charset'
import { tunnelHttpsAgent } from './tunnelAgent'

export const superagentWithCharset = superagentCharset(superagent)

interface Response {
  text: string
}

export interface CrawlerContext<Item, AdditionalParams = null> {
  root: Cheerio<Document>
  currentUrl?: string
  item: Item
  additionalParams?: AdditionalParams
}

export type RequestGenerator = (url: string) => Promise<Response>
export type Transform<Field = unknown, Item = unknown, AdditionalParams = unknown> = ($el: Cheerio<AnyNode>, context: CrawlerContext<Item, AdditionalParams>) => Promise<Field> | Field
export interface SelectorConfig<Field = unknown, Item = unknown, AdditionalParams = unknown> {
  selector?: string | string[]
  transform: Transform<Field, Item, AdditionalParams>
}
export type Selector<Field = unknown, Item = unknown, AdditionalParams = unknown> = string | string[] | SelectorConfig<Field, Item, AdditionalParams>

class Scrapper<Item, AdditionalParams = null> {
  protected _scope: string
  protected _selectors: { [key in keyof Item]?: Selector }
  protected _pagenatorSelector: string
  protected _limit: number
  protected _useProxy: boolean

  scope(scope: string): this {
    this._scope = scope
    return this
  }

  set(selectors: { [key in keyof Item]?: Selector }): this {
    this._selectors = selectors
    return this
  }

  paginate(pagenatorSelector: string): this{
    this._pagenatorSelector = pagenatorSelector
    return this
  }

  limit(limit: number): this {
    this._limit = limit
    return this
  }

  useProxy(useProxy: boolean): this {
    this._useProxy = useProxy
    return this
  }

  private async extractData(
    $el: Cheerio<AnyNode>,
    selector: Selector,
    context: CrawlerContext<Item, AdditionalParams>
  ): Promise<unknown> {
    let transform: Transform = ($el: Cheerio<Document>) => Promise.resolve($el.first().text().trim())
    let selectorQuery: string | string[] | null = null

    const selectorConfig = selector as SelectorConfig
    if (selectorConfig.transform !== undefined) {
      transform = selectorConfig.transform
    }

    if (selectorConfig.selector !== undefined) {
      selectorQuery = selectorConfig.selector
    } else if (typeof selectorConfig == 'string') {
      selectorQuery = selectorConfig
    } else if (Array.isArray(selectorConfig)) {
      selectorQuery = selectorConfig
    }

    if (typeof selectorQuery === 'string') {
      $el = $el.find(selectorQuery)
    } else if (Array.isArray(selectorQuery)) {
      let $r
      for (const s of selectorQuery) {
        $r = $el.find(s)
        if ($r.length) break
      }
      if (!$r) return null
      $el = $r
    }

    if ($el.length) {
      return await transform($el, context)
    } else {
      return null
    }
  }

  async scrap(text: string, results: Item[] = [], additionalParams?: AdditionalParams, currentUrl?: string): Promise<{
    results: Item[]
    nextUrl: string | undefined,
    limitReached: boolean
  }> {
    const $ = load(text, { xmlMode: false })

    const nextUrl =
      this._pagenatorSelector &&
      $(this._pagenatorSelector).attr('href')

    let limitReached = false

    for (const el of $(this._scope)) {
      const item: Record<string, unknown> = {}

      for (const selectorName in this._selectors) {
        const selector = this._selectors[selectorName]
        if (selector !== undefined) {
          item[selectorName] = await this.extractData($(el), selector, {
            root: $.root(),
            currentUrl,
            item: item as Item,
            additionalParams
          })
        }
      }

      results.push(item as Item)

      if (this._limit && results.length >= this._limit) {
        limitReached = true
        break
      }
    }

    return {
      results,
      nextUrl,
      limitReached
    }
  }
}

class Crawler<Item, AdditionalParams = null> extends Scrapper<Item, AdditionalParams> {
  private _requestGenerator: RequestGenerator
  private _url: string
  private _cfbypass = false
  private _timeoutMs: number
  private _headers: Record<string, string>

  constructor(url: string, requestGenerator?: RequestGenerator) {
    super()
    this._requestGenerator = requestGenerator ?? ((nextUrl: string): Promise<Response> => {
      if (this._cfbypass) {
        return this.createCFBypassRequest(nextUrl)
      } else {
        return this.createDefaultRequest(nextUrl)
      }
    })
    this._url = url
  }

  private async createCFBypassRequest(nextUrl: string): Promise<Response> {
    return await invokeCFBypass(nextUrl, 'get', this.headers)
  }

  private createDefaultRequest(nextUrl: string): Promise<Response> {
    const targetUrl = nextUrl != this._url ?
      new URL(nextUrl, this._url).toString() :
      nextUrl

    const request = superagentWithCharset
      .get(targetUrl)

    if(this._useProxy) {
      request.agent(tunnelHttpsAgent)
    }

    return request
      .buffer(true)
      .charset()
      .timeout(this._timeoutMs)
      .disableTLSCerts()
      .set(this._headers ?? {})
  }

  cfbypass(bypass: boolean): this {
    this._cfbypass = bypass
    return this
  }

  headers(headers: Record<string, string>): this {
    this._headers = headers
    return this
  }

  timeout(ms: number): this {
    this._timeoutMs = ms
    return this
  }

  gather(additionalParams?: AdditionalParams): Promise<Item[]> {
    if (!this._scope) {
      throw Error('No scope selected')
    }

    if (!this._selectors) {
      throw Error('No selectors set')
    }

    const allResults: Item[] = []

    const step = async (currentUrl: string): Promise<Item[]> => {
      const res = await this._requestGenerator(currentUrl)

      const { nextUrl, limitReached } = await this.scrap(res.text, allResults, additionalParams, currentUrl)

      if (!nextUrl || limitReached) {
        return allResults
      }

      return step(nextUrl)
    }

    return step(this._url)
  }
}

export default {
  Crawler,
  Scrapper,
  get<Item, AdditionalParams = null>(url: string, requestGenerator?: RequestGenerator): Crawler<Item, AdditionalParams> {
    return new Crawler<Item, AdditionalParams>(url, requestGenerator)
  }
}
