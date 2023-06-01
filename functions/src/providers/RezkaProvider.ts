import Provider, { InfoSelectors, SearchSelectors } from './CrawlerProvider'
import providersConfig from '../providersConfig'
import urlencode from 'urlencode'
import superagent from 'superagent'
import { AnyNode, Cheerio } from 'cheerio'
import $ from 'cheerio'
import { base64decode, base64encode } from '../utils/base64'
import { File, ProviderConfig } from '../types'
import parsePlayerJSFile from '../utils/parsePlayerJSFile'
import { extractStringProperty } from '../utils/extractScriptVariable'
import { DataNode } from 'domhandler'
import decodePlayerJSPlaylist from '../utils/decodePlayerJSPlaylist'
import { tunnelHttpsAgent } from '../utils/tunnelAgent'

const PLAYLIST_REGEXP = /initCDNSeriesEvents\(\d+, (\d+)/

interface RezkaProviderConfig extends ProviderConfig {
  decodeKeys: string[]
}

class RezkaProvider extends Provider<RezkaProviderConfig> {
  protected override searchScope = '.b-content__inline_item'
  protected override searchSelector: SearchSelectors = {
    id: {
      transform: ($el) => urlencode($el.attr('data-url')!)
    },
    name: {
      selector: '.b-content__inline_item-link',
      transform: ($el) => {
        const name = $el.find('>a').text()
        const [year] = $el.find('>div').text().split(',')
        
        return `${name} (${year})`
      }
    },
    image: {
      selector: '.b-content__inline_item-cover > a > img',
      transform: ($el) => this.absoluteUrl($el.attr('src')!),
    }
  }

  protected override infoScope = '.b-post'
  protected override infoSelectors: InfoSelectors = {
    title: '.b-post__title h1',
    image: {
      selector: '.b-sidecover > a >  img',
      transform: ($el) => this.absoluteUrl($el.attr('src')!),
    },
    files: {
      transform: ($scope, context) => {
        const scripts = this.extractPlayerConfigScript(context.root)

        if (scripts.length == 0) return []

        const files = this.tryExtractTVShowFiles($scope, scripts[0])

        if (files.length > 0) {
            return files.map((item, index) => {
              item.id = index
              return item
            })
        } else {
            return this.getMovieFile(scripts[0])
        }
      },
    }
  }

  constructor() {
    super('rezka', providersConfig.providers.rezka as RezkaProviderConfig)
  }

  tryExtractTVShowFiles($scope: Cheerio<AnyNode>, playerScript: string): File[] {
    const matches = playerScript.match(PLAYLIST_REGEXP)
    const translatorId = matches && matches[1]

    if(!translatorId) {
      return []
    }

    return $scope
      .find('#simple-episodes-tabs .b-simple_episode__item')
      .toArray()
      .map((el) => {
        const $el = $(el)
        const dataId = $el.attr('data-id')
        const season = $el.attr('data-season_id')
        const episode = $el.attr('data-episode_id')

        return {
          id: 0,
          asyncSource: base64encode(
            JSON.stringify({
              dataId,
              season,
              episode,
              translatorId
            })
          ),
          path: season && `Season ${season}`,
          name: `Episode ${episode}`,
        }
      })
  }

  getMovieFile(playerScript: string): File[] {
    const streams = extractStringProperty(playerScript, 'streams')

    if(!streams) {
      return []
    }

    const playlist = decodePlayerJSPlaylist(streams.replace(/\\/g, ''), this.config.decodeKeys)

    if(!playlist) {
      return []
    }

    return [
      {
        id: 0,
        name: null,
        urls: parsePlayerJSFile(playlist),
      },
    ]
  }

  extractPlayerConfigScript($root: Cheerio<AnyNode>): string[] {
    const scripts = $root
      .find('body > script')
      .toArray()
      .map((el) => el.children)
      .filter((el) => el && el.length > 0)
      .map((el) => (el[0] as DataNode).data)

    return scripts.filter((el) =>
      el.startsWith(' $(function () { sof.tv.initCDN')
    )
  }

  override async getSource(resultsId: string, sourceId: string): Promise<Partial<File> | null> {
    const { baseUrl, headers, timeout } = this.config

    const { dataId, translatorId, season, episode } = JSON.parse(base64decode(sourceId))

    const res = await superagent
      .post(`${baseUrl}/ajax/get_cdn_series/?t=${Date.now()}`)
      .agent(tunnelHttpsAgent)
      .send(`id=${dataId}&translator_id=${translatorId}&season=${season}&episode=${episode}&action=get_stream`)
      .timeout(timeout!)
      .set({
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded'
      })

    const body = JSON.parse(res.text)

    const playlist = decodePlayerJSPlaylist(body.url, this.config.decodeKeys)

    if(!playlist) {
      return null
    }

    return { urls: parsePlayerJSFile(playlist) }
  }

  override getSearchUrl(query: string): string {
    return `${this.config.searchUrl}&q=${encodeURIComponent(query)}`
  }

}

export default RezkaProvider