import CrawlerProvider from './CrawlerProvider'
import providersConfig from '../providersConfig'
import $, { AnyNode, Cheerio, load } from 'cheerio'
import { extractObject } from '../utils/extractScriptVariable'
import superagent from 'superagent'
import { File, ProviderConfig, SearchResult } from '../types'
import { lastPathPart } from '../utils/url'
import crawler, { superagentWithCharset } from '../utils/crawler'

const BLOCK_COUNTIRES_REGEXP = /&block=[a-z,]+/
const EMBED_ID_REGEXP = /embed\/(\d+)/

interface GidOnlineProviderConfig extends ProviderConfig {
  decodeKeys: string[]
}

interface Translation {
  name: string
  token: string
}

interface SeasonEpisodes {
  [key: string]: number[]
}

class GidOnlineProvider extends CrawlerProvider<GidOnlineProviderConfig> {
  protected searchScope = '.mainlink'
  protected searchSelector = {
    id: {
      transform: ($el: Cheerio<AnyNode>): string => lastPathPart($el.attr('href'))
    },
    image: {
      selector: 'img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('src') ?? '')
    },
    name: {
      transform: ($el: Cheerio<AnyNode>): string => {
        const name = $el.find('span').text()
        const year = $el.find('.mqn').text()

        return `${name} (${year})`
      }
    }
  }
  protected infoScope = '#main'
  protected infoSelectors = {
    title: '#single > .t-row > .r-1 > .rl-2',
    image: {
      selector: '#single > img.t-img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('src') ?? '')
    },
    files: {
      selector: '#cdn-player',
      transform: async ($el: Cheerio<AnyNode>): Promise<File[]> => {
        let iframeSrc = $el.attr('src')

        if (!iframeSrc)
          return []

        iframeSrc = iframeSrc.replace(BLOCK_COUNTIRES_REGEXP, '')

        const res = await superagent
          .get(iframeSrc)
          .set(this.config.headers!)
          .timeout(5000)
          .disableTLSCerts()

        const $iframe = load(res.text)
        const translations: Translation[] = $iframe('#translator-name > option')
          .toArray()
          .map((el) => {
            const $el = $(el)
            return {
              name: $el.text(),
              token: $el.data('token') as string
            }
          })

        const seasonsEpisodes = extractObject(res.text, 'seasons_episodes') as SeasonEpisodes

        if (seasonsEpisodes == null) {
          return this.extractMoviesFiles(translations)
        }

        translations[0].token = this.extractEmbedId(iframeSrc)

        const files = this.createTranslationFiles(translations[0], seasonsEpisodes, 'embed')

        const translationFiles = await Promise.all(
          translations.slice(1)
            .map(async (translation, index) => {
              try {
                return this.createTranslationFiles(
                  translation,
                  await this.loadTranslationEpisodes(translation)
                )
              } catch (e) {
                this.debug(`Error to load translation files: ${translation.name}(${translation.token})`, e)
                return []
              }
            })
        )

        translationFiles.forEach((tf) => tf.forEach((f) => files.push(f)))

        return files.map((file, index) => {
          file.id = index + 1
          return file
        })
      }
    }
  }

  constructor() {
    super('gidonline', providersConfig.providers.gidonline as GidOnlineProviderConfig)
  }

  private getIframeUrl(token: string, type: string): string {
    let basePath

    if (type == 'embed') {
      basePath = `https://voidboost.net/embed/${token}`
    } else {
      basePath = `https://voidboost.net/${type}/${token}/iframe`
    }

    return `${basePath}?&h=gidonline.io&&df=1&vstop=7&vsleft=44&partner=gidonline`
  }

  private async loadTranslationEpisodes(translation: Translation): Promise<SeasonEpisodes> {
    const url = this.getIframeUrl(translation.token, 'serial')

    const res = await superagent
      .get(url)
      .set(this.config.headers!)
      .timeout(5000)
      .disableTLSCerts()

    return extractObject(res.text, 'seasons_episodes') as SeasonEpisodes
  }

  private extractMoviesFiles(translations: Translation[]): File[] {
    return translations.map((translation, index) => ({
      name: translation.name,
      id: index + 1,
      asyncSource: {
        sourceId: translation.token,
        params: {
          type: 'movie'
        }
      }
    })
    )
  }

  private extractEmbedId(iframeSrc: string): string {
    const match = iframeSrc.match(EMBED_ID_REGEXP)

    if (!match) return ''

    return match[match.length - 1]
  }

  private createTranslationFiles(
    translation: Translation,
    seasonEpisodes: SeasonEpisodes,
    type: 'serial' | 'embed' = 'serial'
  ): File[] {
    const seasons = Object.keys(seasonEpisodes)

    if (seasons.length == 1) {
      const season = seasons[0]
      const episodes = seasonEpisodes[seasons[0]]

      return episodes.map((ep) => ({
        name: 'Episode ' + ep,
        path: translation.name,
        id: 0,
        asyncSource: {
          sourceId: translation.token,
          params: {
            type,
            s: season,
            e: ep
          }
        }
      }))
    }

    return seasons.flatMap((season) => {
      const episodes = seasonEpisodes[seasons[0]]

      return episodes.map((ep) => ({
        name: 'Episode ' + ep,
        path: translation.name + '/' + 'Season ' + season,
        id: 0,
        asyncSource: {
          sourceId: translation.token,
          params: {
            type,
            s: season,
            e: ep
          }
        }
      }))
    })
  }

  override getInfoUrl(id: string): string {
    if (id.startsWith('http')) {
      return super.getInfoUrl(id)
    }

    const { baseUrl } = this.config
    return `${baseUrl}/film/${id}`
  }

  override async search(query: string): Promise<SearchResult[]> {
    const name = this.getName()
    const {
      headers,
      timeout,
    } = this.config

    query = this.prepareQuery(query)

    this.getSearchUrl(query)

    const res = await superagentWithCharset
      .get(this.getSearchUrl(query))
      .buffer(true)
      .charset()
      .timeout(timeout!)
      .disableTLSCerts()
      .set(headers!)

    let results: SearchResult[] = []
    const scrapper = new crawler.Scrapper<SearchResult>()


    if(res.redirects.length == 0) {
      await scrapper
        .scope(this.searchScope)
        .set(this.searchSelector)
        .scrap(res.text, results)
    } else {
      await scrapper
        .scope(this.infoScope)
        .set({
          name: this.infoSelectors.title,
          image: this.infoSelectors.image,
          id: {
            transform: () => lastPathPart(res.redirects[res.redirects.length - 1])
          }
        })
        .scrap(res.text, results)
    }

    results = await this.postProcessResult(results)

    return results
      .filter((item) => item.id)
      .map((item) => {
        item.provider = name
        return item
      })
  }

  getSearchUrl(query: string): string {
    const { searchUrl } = this.config

    return `${searchUrl}?s=${encodeURIComponent(query)}`
  }

}

export default GidOnlineProvider