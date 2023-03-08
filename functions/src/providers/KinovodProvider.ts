import CrawlerProvider from './CrawlerProvider'
import { extractNumber, extractString } from '../utils/extractScriptVariable'
import convertPlayerJSPlaylist from '../utils/convertPlayerJSPlaylist'
import urlencode from 'urlencode'
import superagent from 'superagent'
import { AnyNode, Cheerio } from 'cheerio'
import providersConfig from '../providersConfig'
import { File } from '../types/index'
import { ProcessingInstruction } from 'domhandler'

class KinovodProvider extends CrawlerProvider {
  protected searchScope = '.items>.item'
  protected searchSelector = {
    id: {
      selector: '>a',
      transform: ($el: Cheerio<AnyNode>): string => urlencode($el.attr('href') ?? '')
    },
    name: '>.info>.title>a',
    image: {
      selector: '>a>img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('src') ?? '')
    }
  }
  protected infoScope = '.content'
  protected infoSelectors = {
    title: '#movie>div>h1',
    image: {
      selector: '.poster img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('src') ?? '')
    },
    files: {
      selector: 'script',
      transform: async ($el: Cheerio<AnyNode>): Promise<File[]> => {
        const targetScripts = $el
          .filter(':not([src])')
          .toArray()
          .map((el) => el.children[0] as ProcessingInstruction)
          .map((pi) => pi.data)
          .filter((text) => text.startsWith('\nvar MOVIE_ID'))

        if (targetScripts.length != 1)
          return []

        const targetScript = targetScripts[0]
        const movieId = extractNumber(targetScript, 'MOVIE_ID')
        const playerCuid = extractString(targetScript, 'PLAYER_CUID')
        const identifier = extractString(targetScript, 'IDENTIFIER')

        let res
        let url = `${this.config.baseUrl}/user_data?page=movie&movie_id=${movieId}&cuid=${playerCuid}&device=DESKTOP&_=${Date.now()}`

        try {
          res = await superagent
            .get(url)
            .timeout(this.config.timeout!)
        } catch (e) {
          console.error(e)
          return []
        }

        const resJson = JSON.parse(res.text)
        const vodHash = resJson.vod_hash
        const vodTime = resJson.vod_time

        url = `${this.config.baseUrl}/vod/${movieId}?identifier=${identifier}&player_type=new&file_type=hls&st=${vodHash}&e=${vodTime}&_=${Date.now()}`

        try {
          res = await superagent
            .get(url)
            .timeout(this.config.timeout!)
        } catch (e) {
          return []
        }

        const playerJsPlaylist = res.text.split('|')[1]

        return convertPlayerJSPlaylist(playerJsPlaylist)
          .map((item, id) => ({ ...item, id }))
      }
    }
  }

  constructor() {
    super('kinovod', providersConfig.providers.kinovod)
  }

  override getSearchUrl(query: string): string {
    return `${this.config.searchUrl}?query=${encodeURIComponent(query)}`
  }
}

export default KinovodProvider