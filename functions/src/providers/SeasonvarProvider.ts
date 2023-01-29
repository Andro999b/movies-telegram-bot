import Provider from './CrawlerProvider'
import urlencode from 'urlencode'
import superagent from 'superagent'
import convertPlayerJSPlaylist from '../utils/convertPlayerJSPlaylist'
import { File, ProviderConfig, SearchResult, UrlAndQuality } from '../types/index'
import { AnyNode, Cheerio } from 'cheerio'
import { ProcessingInstruction } from 'domhandler'
import providersConfig from '../providersConfig'
import decodePlayerJSPlaylist from '../utils/decodePlayerJSPlaylist'

interface SeasonvarProviderConfig extends ProviderConfig {
  encryptKey: string
}

interface SeasonvarSearchResponse {
  suggestions: {
    valu: string[]
  }
  data: string[]
}

class SeasonvarProvider extends Provider<SeasonvarProviderConfig> {
  protected searchScope: string
  protected searchSelector = { id: '', name: '' }

  protected infoScope = '.middle'
  protected infoSelectors = {
    title: '.pgs-sinfo-title',
    image: {
      selector: '.poster img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('src') ?? '')
    },
    files: {
      transform: async ($el: Cheerio<AnyNode>): Promise<File[]> => {
        // extract serial id
        const $info = $el.find('.pgs-sinfo')
        const serialId = $info.attr('data-id-serial')
        const seasonId = $info.attr('data-id-season')

        if (!serialId || !seasonId) return []

        // extract security mark
        let matches
        $el.find('script').each((_, elem): boolean => {
          const script = elem.children[0] as ProcessingInstruction

          if (script) {
            matches = script.data.match(/'secureMark': '([0-9a-z]+)'/)
            if (matches) return false
          }

          return true
        })

        if (!matches) return []
        const secureMark = matches[1]

        const files = await this.extractSeasonFiles(serialId, seasonId, secureMark)

        return files.map((file, index) => ({
          ...file,
          id: index + 1
        }))
      }
    },
    errorDetail: '.pgs-player-block'
  }

  constructor() {
    super('seasonvar', providersConfig.providers.seasonvar as SeasonvarProviderConfig)
  }

  override async search(query: string): Promise<SearchResult[]> {
    const { searchUrl, timeout } = this.config

    query = this.prepareQuery(query)

    const res = await superagent
      .get(`${searchUrl}?query=${encodeURIComponent(query)}`)
      .timeout(timeout!)


    const body = JSON.parse(res.text)
    if (!body.suggestions || !body.suggestions.valu) return []

    const { suggestions: { valu }, data } = body as SeasonvarSearchResponse

    return valu
      .filter((_: unknown, index: number) => data[index] && data[index].endsWith('html'))
      .map((name, index) => ({
        name: name.replace(/<[^>]*>/g, ''),
        id: urlencode(this.config.baseUrl + '/' + data[index]),
        provider: this.name
      }))
  }

  private async extractSeasonFiles(serialId: string, seasonId: string, secureMark: string): Promise<File[]> {
    try {
      const res = await superagent
        .post(`${this.config.baseUrl}/player.php`)
        .set('X-Requested-With', 'XMLHttpRequest')
        .type('form')
        .timeout(this.config.timeout!)
        .send({
          id: seasonId,
          serial: serialId,
          secure: secureMark,
          time: Date.now(),
          type: 'html5'
        })

      const matches = res.text.match(/'0': "(.+)"/)
      if (!matches) return []
      const plist = matches[1]

      const plistRes = await superagent
        .get(`${this.config.baseUrl}${plist}`)
        .timeout(this.config.timeout!)

      const playlist = JSON.parse(plistRes.text)

      return convertPlayerJSPlaylist(playlist, (x) => this.decryptFilePath(x))
        .map((file) => {
          file.name = file.name!.replace(/<[^>]*>?/g, '')
          return file
        })
      // return translations
    } catch (e) {
      console.error('Seasonvar sesson extractor failed', e)
      return []
    }
  }

  private decryptFilePath(x: string): UrlAndQuality[] {
    const { encryptKey } = this.config

    return [{
      url: decodePlayerJSPlaylist(x, [encryptKey], '//') ?? '',
      quality: 0
    }]
  }

  override getSearchUrl(): string {
    throw new Error('Method not implemented.')
  }
}

export default SeasonvarProvider