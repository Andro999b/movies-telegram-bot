import Provider from './DataLifeProvider'
import { extractObject, extractStringProperty } from '../utils/extractScriptVariable'
import urlencode from 'urlencode'
import superagent from 'superagent'
import convertPlayerJSPlaylist from '../utils/convertPlayerJSPlaylist'
import { AnyNode, Cheerio } from 'cheerio'
import { File } from '../types/index'
import providersConfig from '../providersConfig'
import { ProcessingInstruction } from 'domhandler'

class AnimeVostProvider extends Provider {
  protected searchScope = '.shortstory'
  protected searchSelector = {
    id: {
      selector: '.shortstoryHead a',
      transform: ($el: Cheerio<AnyNode>): string => urlencode($el.attr('href') ?? '')
    },
    name: '.shortstoryHead a',
    image: {
      selector: '.shortstoryContent div > a > img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('src') ?? '')
    }
  }
  protected infoSelectors = {
    title: '.shortstoryHead h1',
    image: {
      selector: '.imgRadius',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('src') ?? '')
    },
    files: {
      selector: '.functionPanel',
      transform: ($el: Cheerio<AnyNode>): File[] => {
        let episodesData: Record<string, unknown> | null = null

        for (const item of $el.nextAll('script').toArray()) {
          if (item.children.length != 0) {
            const script = item.children[0] as ProcessingInstruction

            episodesData = extractObject(script.data, 'data')

            if (episodesData) break
          }
        }

        if (!episodesData) return []

        return Object.keys(episodesData)
          .map((key, index) => {
            const playerUrl = episodesData![key] as string
            return {
              id: index,
              name: key,
              asyncSource: urlencode(playerUrl)
            }
          })
      }
    }
  }

  constructor() {
    super('animevost', providersConfig.providers.animevost)
  }

  override async getSource(resultsId: string, sourceId: string): Promise<Partial<File> | null> {
    const siteRes = await superagent
      .get(`${this.config.playerUrl}?play=${decodeURIComponent(sourceId)}&old=1`)
      .timeout(5000)
      .disableTLSCerts()

    const playerJsPlaylist = extractStringProperty(siteRes.text, 'file')
    if (!playerJsPlaylist) return null

    return convertPlayerJSPlaylist(playerJsPlaylist)[0]
  }
}

export default AnimeVostProvider