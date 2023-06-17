import { load } from 'cheerio'
import providersConfig from '../providersConfig'
import { File, FileUrl, SearchResult } from '../types'
import CrawlerProvider, { InfoSelectors, SearchSelectors } from './CrawlerProvider'
import superagent from 'superagent'
import { lastPathPart } from '../utils/url'
import { tunnelHttpsAgent } from '../utils/tunnelAgent'

interface APISearchResponse {
  href: string
  rus_name: string
  releaseDate: string
  cover: {
    default: string
  }
}

interface PlayerData {
  video_hosts: {
    host: string
  }[]
  players: {
    [key: string]: {
      player: 'Kodik' | 'Animelib'
      code: string | null
      team: {
        name: string
      }
      video: {
        quality: {
          href: string
          quality: number
        }[]
        subtitle: {
          href: string
          language: string
        }
      }
    }[]
  }
}

const REG_EXP_DATA = /window\.__DATA__ = (.+);$/m

class AnimelibProvider extends CrawlerProvider {
  protected override searchScope: string
  protected override searchSelector: SearchSelectors
  protected override infoScope = '.media-container'
  protected override infoSelectors: InfoSelectors = {
    title: '.media-name__main',
    image: {
      selector: '.media-sidebar__cover > img',
      transform: ($el) => this.absoluteImageUrl($el.attr('src') ?? '')
    },
    files: {
      selector: '.media-sidebar__buttons > a',
      transform: async ($el) => {
        const playerUrl = $el.attr('href')
        const { timeout, headers, bypassMode } = this.config

        if (!playerUrl) {
          throw new Error('Unable to extract player url')
        }

        const playerRes = await superagent
          .get(playerUrl)
          .agent(bypassMode == 'proxy' ? tunnelHttpsAgent : undefined)
          .timeout(timeout!)
          .set(headers!)

        const urls = this.extractUrls(playerRes.text)
        const files = this.extractEpisodes(playerRes.text)

        if (files.length == 0) {
          return [{
            id: 0,
            name: null,
            urls
          }]
        }

        delete files[0].asyncSource
        files[0].urls = urls

        return files
      }
    }
  }

  private extractEpisodes(playerHtml: string): File[] {
    const $ = load(playerHtml)
    return $('#episodes-list-modal .modal__body a')
      .toArray()
      .map((el) => {
        const $el = $(el)

        return {
          name: $el.text().replace(/\n/, '').trim(),
          asyncSource: lastPathPart($el.attr('href'))
        }
      })
      .reverse()
      .map((data, id) => ({ id, ...data }))
  }

  private extractUrls(playerHtml: string): FileUrl[] {
    const { baseUrl } = this.config
    const matches = playerHtml.match(REG_EXP_DATA)

    if (!matches) {
      throw new Error('No player data found')
    }

    const [, dataStr] = matches
    const data = JSON.parse(dataStr) as PlayerData
    const result: FileUrl[] = []

    const { players, video_hosts } = data
    Object.values(players)
      .flatMap((p) => p)
      .forEach((p) => {
        if (p.player == 'Animelib') {
          const { quality, subtitle } = p.video
          quality.forEach(({ href, quality }) => {
            const fileUrl: FileUrl = {
              audio: p.team.name,
              url: video_hosts[0].host + href,
              quality,
            }
            if (subtitle) {
              fileUrl.subtitle = [{
                url: baseUrl + subtitle.href,
                language: subtitle.language
              }]
            }
            result.push(fileUrl)
          })

          return
        }

        if (p.player == 'Kodik') {
          result.push({
            audio: p.team.name,
            url: p.code!,
            extractor: {
              type: 'animelib_kodik'
            }
          })
        }
      })

    result.sort((a, b) => (a.subtitle ? 1 : 0) - (b.subtitle ? 1 : 0))

    return result
  }

  override async search(query: string): Promise<SearchResult[]> {
    const { timeout, bypassMode } = this.config

    const res = await superagent
      .get(this.getSearchUrl(query))
      .agent(bypassMode == 'proxy' ? tunnelHttpsAgent : undefined)
      .timeout(timeout!)

    const apiSearchResponse = res.body as APISearchResponse[]

    return apiSearchResponse.map((r) => {
      let name = r.rus_name

      if (r.releaseDate) {
        name += `(${r.releaseDate.split('-')[0]})`
      }

      const id = lastPathPart(r.href)

      return {
        name,
        id: id,
        image: r.cover.default,
        provider: this.name,
        infoUrl: this.getInfoUrl(id)
      }
    })
  }

  override getSearchUrl(query: string): string {
    const { searchUrl } = this.config

    return `${searchUrl}?type=anime&q=${encodeURIComponent(query)}`
  }

  override getInfoUrl(id: string): string {
    const { baseUrl } = this.config

    return `${baseUrl}/anime/${id}`
  }

  override async getSource(resultsId: string, sourceId: string): Promise<Partial<File> | null> {
    const { bypassMode, timeout, headers } = this.config
    const playerUrl = this.getInfoUrl(resultsId) + '/episode/' + sourceId

    const playerRes = await superagent
      .get(playerUrl)
      .agent(bypassMode == 'proxy' ? tunnelHttpsAgent : undefined)
      .timeout(timeout!)
      .set(headers!)

    const urls = this.extractUrls(playerRes.text)
    return {
      urls
    }
  }

  constructor() {
    super('animelib', providersConfig.providers.animelib)
  }
}

export default AnimelibProvider