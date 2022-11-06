import Provider from './DataLifeProvider.js'
import urlencode from 'urlencode'
import superagent from 'superagent'
import $, { AnyNode, Cheerio, Element, load } from 'cheerio'
import providersConfig from '../providersConfig.js'
import { File, FileUrl } from '../types/index.js'

class AnigatoProvider extends Provider {
  protected searchScope = '.sres-wrap'
  protected searchSelector = {
    id: {
      transform: ($el: Cheerio<AnyNode>): string => urlencode($el.attr('href') ?? '')
    },
    name: '.sres-wrap h2',
    image: {
      selector: '.sres-img img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('src') ?? '')
    }
  }
  protected infoSelectors = {
    title: '.short-top-left h1',
    image: {
      selector: '.mimg img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('src') ?? '')
    },
    files: {
      selector: '#kodik-player iframe',
      transform: async ($el: Cheerio<AnyNode>): Promise<File[]> => {
        let iframeSrc = $el.attr('src')
          ?.replace('kodik.info', 'kodik.biz')
          ?.replace('kodik.cc', 'kodik.biz')
          ?.replace('aniqit.com', 'kodik.biz')

        if (!iframeSrc) return []

        iframeSrc = iframeSrc.startsWith('//') ? 'https:' + iframeSrc : iframeSrc
        const res = await superagent
          .get(iframeSrc)
          .set({ ...this.config.headers })
          .timeout(this.config.timeout!)

        const $iframe = load(res.text)
        const $seasons = $iframe('.series-options')
          .first()
          .children()
          .toArray()

        const $translations = $iframe('.serial-translations-box, .movie-translations-box')
          .find('option')
          .toArray()

        let files: File[]
        if ($seasons.length == 0) {
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
              urls: $translations.map((t) => {
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
        } else if ($seasons.length == 1) {
          const $season = $($seasons[0])
          const seasonNum = this.getSeassonNum($season)
          files = $season
            .find('option')
            .toArray()
            .map((el, id) => {
              const $el: Cheerio<AnyNode> = $(el)
              return {
                id,
                name: $el.text(),
                urls: this.getSeasonEpisodeUrls($el, seasonNum, $translations, iframeSrc!)
              }
            })
        } else {
          files = $seasons
            .map((el) => {
              const $season = $(el)
              const seasonNum = this.getSeassonNum($season)
              return $season
                .find('option')
                .toArray()
                .map((el) => {
                  const $el = $(el)
                  return {
                    name: $el.text(),
                    path: `Season ${seasonNum}`,
                    urls: this.getSeasonEpisodeUrls($el, seasonNum, $translations, iframeSrc!)
                  }
                })
            })
            .reduce((acc, items) => acc.concat(items), [])
            .map((items, id) => ({ id, ...items }))
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
    season: string,
    $translations: Element[],
    iframeSrc: string
  ): FileUrl[] {
    if ($translations.length == 0) {
      const [, ttype, tid, thash] = new URL(iframeSrc).pathname.split('/')
      return [{
        url: '' + $el.val(),
        hls: true,
        extractor: { type: 'anigit', params: { season, ttype, tid, thash } }
      }]
    } else {
      return $translations.map((t) => {
        const $t = $(t)

        return {
          url: '' + $el.val(),
          audio: $t.text(),
          hls: true,
          extractor: {
            type: 'anigit',
            params: {
              season,
              ...this.getTranslationParams($t)
            }
          }
        }
      })
    }
  }

  private getSeassonNum($season: Cheerio<AnyNode>): string {
    return $season.attr('class')!.substring('season-'.length)
  }
}

export default AnigatoProvider