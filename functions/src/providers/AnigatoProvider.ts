import Provider from './DataLifeProvider'
import urlencode from 'urlencode'
import superagent from 'superagent'
import $, { AnyNode, Cheerio, Element, load } from 'cheerio'
import providersConfig from '../providersConfig'
import { File, FileUrl, Playlist } from '../types/index'
import { CrawlerContext } from '../utils/crawler'
import { InfoParams } from './CrawlerProvider'

class AnigatoProvider extends Provider {
  protected searchScope = '.sres-wrap'
  protected searchSelector = {
    id: {
      transform: ($el: Cheerio<AnyNode>): string => urlencode($el.attr('href') ?? '')
    },
    name: '.sres-wrap h2',
    image: {
      selector: '.sres-img img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteImageUrl($el.attr('src') ?? '')
    }
  }
  protected infoSelectors = {
    title: '.short-top-left h1',
    image: {
      selector: '.mimg img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteImageUrl($el.attr('src') ?? '')
    },
    files: {
      selector: '#kodik-player iframe',
      transform: async ($el: Cheerio<AnyNode>, context: CrawlerContext<Playlist, InfoParams>): Promise<File[]> => {
        let iframeSrc = $el.attr('src')
          ?.replace('kodik.info', 'kodik.biz')
          ?.replace('kodik.cc', 'kodik.biz')
          ?.replace('aniqit.com', 'kodik.biz')

        if (!iframeSrc) return []

        if (!iframeSrc.endsWith('?only_season=true')) {
          iframeSrc = iframeSrc + '?only_season=true'
        }

        iframeSrc = iframeSrc.startsWith('//') ? 'https:' + iframeSrc : iframeSrc
        const res = await superagent
          .get(iframeSrc)
          .set({ ...this.config.headers })
          .timeout(this.config.timeout!)

        const $iframe = load(res.text)

        const $translations = $iframe('.serial-translations-box, .movie-translations-box')
          .find('option')

        if ($translations.length > 0) {
          context.item.defaultAudio = $translations.filter(':selected').text()
        }

        let files: File[]
        if (iframeSrc.includes('video')) {
          if ($translations.length == 0) {
            files = [{
              id: 0,
              name: null,
              urls: [{
                url: iframeSrc,
                hls: true,
                extractor: { type: 'anigit' }
              }]
            }]
          } else {
            files = [{
              id: 0,
              name: null,
              urls: $translations.toArray().map((t) => {
                const $t = $(t)
                return {
                  url: '',
                  audio: $t.text(),
                  hls: true,
                  extractor: {
                    type: 'anigit',
                    params: this.getTranslationParams($t)
                  }
                }
              })
            }]
          }
        } else {
          const $episodes = $iframe('.serial-series-box > select > option')

          files = $episodes
            .toArray()
            .map((el, id) => {
              const $ep: Cheerio<AnyNode> = $(el)
              return {
                id,
                name: $ep.text(),
                urls: this.getSeasonEpisodeUrls($ep, $translations.toArray(), iframeSrc!)
              }
            })
        }

        return files.filter((f) => f.urls!.length > 0)
      }
    }
  }

  constructor() {
    super('anigato', providersConfig.providers.anigato)
  }

  private getTranslationParams($t: Cheerio<AnyNode>): Record<string, string | undefined> {
    return {
      thash: $t.attr('data-media-hash'),
      tid: $t.attr('data-media-id'),
      ttype: $t.attr('data-media-type'),
    }
  }

  private getSeasonEpisodeUrls(
    $el: Cheerio<AnyNode>,
    translations: Element[],
    iframeSrc: string
  ): FileUrl[] {
    if (translations.length == 0) {
      const [, ttype, tid, thash] = new URL(iframeSrc).pathname.split('/')
      return [{
        url: '' + $el.val(),
        hls: true,
        extractor: { type: 'anigit', params: { ttype, tid, thash } }
      }]
    } else {
      return translations.map((t) => {
        const $t = $(t)

        return {
          url: '' + $el.val(),
          audio: $t.text(),
          hls: true,
          extractor: {
            type: 'anigit',
            params: {
              ...this.getTranslationParams($t)
            }
          }
        }
      })
    }
  }
}

export default AnigatoProvider