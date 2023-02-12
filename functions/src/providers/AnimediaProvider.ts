import Provider from './CrawlerProvider'
import superagent from 'superagent'
import { AnyNode, Cheerio, load } from 'cheerio'
import $ from 'cheerio'
import convertPlayerJSPlaylist from '../utils/convertPlayerJSPlaylist'
import { File, SearchResult } from '../types/index'
import providersConfig from '../providersConfig'
import { lastPathPart } from '../utils/url'

class AnimediaProvider extends Provider {
  protected searchScope: string
  protected searchSelector = { id: '', name: '' }

  protected infoScope = '.content-container'
  protected infoSelectors = {
    title: '.breadcrumbs__list .breadcrumbs__list__item:last-child',
    image: {
      selector: '.widget__post-info__poster .zoomLink',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('href') ?? '')
    },
    files: {
      selector: '.media__tabs',
      transform: async ($el: Cheerio<AnyNode>): Promise<File[]> => {
        const { baseUrl, timeout } = this.config
        const dataId = $el.find('>ul').attr('data-entry_id')
        const seasons = $el.find('ul li a')
          .toArray()
          .map((el) => {
            const $el = $(el)
            return {
              seasonNum: parseInt($el.attr('href')!.substring(4)) + 1,
              name: $el.text()
            }
          })

        const playlistsLoaders = seasons.map(({ seasonNum }) =>
          superagent
            .get(`${baseUrl}/embeds/playlist-j.txt/${dataId}/${seasonNum}`)
            .timeout(timeout!)
            .then((it) => it.text)
        )
        const playlists = await Promise.all(playlistsLoaders)

        if (playlists.length == 1) {
          return convertPlayerJSPlaylist(JSON.parse(playlists[0]))
            .map((file, id) => ({ ...file, id }))
        } else {
          let id = 0
          return playlists.reduce((files, playlist, i) => {
            const playlistFiles = convertPlayerJSPlaylist(JSON.parse(playlist))
              .map((file) => ({ ...file, id: ++id, path: seasons[i].name }))

            return [...files, ...playlistFiles]
          }, [])
        }
      }
    }
  }

  constructor() {
    super('animedia', providersConfig.providers.animedia)
  }

  override async search(query: string): Promise<SearchResult[]> {
    const { searchUrl, timeout } = this.config

    query = this.prepareQuery(query)

    const res = await superagent
      .get(`${searchUrl}?keywords=${encodeURIComponent(query)}&limit=12&orderby_sort=entry_date|desc`)
      .timeout(timeout!)

    const $results = load(res.text).root()

    return $results
      .find('.ads-list__item')
      .toArray()
      .map((el) => {
        const $el = $(el)
        const $title = $el.find('.ads-list__item__title')
        const $image = $el.find('.ads-list__item__thumb > a > img')

        let src = $image.attr('data-src') ?? ''
        const index = src.indexOf('?')
        src = src.substring(0, index)

        return {
          provider: this.name,
          id: lastPathPart($title.attr('href') ?? ''),
          name: $title.text(),
          image: src
        }
      })
  }

  override getSearchUrl(): string {
    throw new Error('Method not implemented.')
  }

  override getInfoUrl(id: string): string {
    if (id.startsWith('http')) {
      return super.getInfoUrl(id)
    }

    const { baseUrl } = this.config
    return `${baseUrl}/anime/${id}`
  }
}

export default AnimediaProvider