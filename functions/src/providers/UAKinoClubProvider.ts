import Provider from './CFDataLifeProvider.js'
import providerConfig from '../providersConfig.js'
import $, { AnyNode, Cheerio } from 'cheerio'
import urlencode from 'urlencode'
import { InfoSelectors, SearchSelector } from './CrawlerProvider.js'
import { File, FileUrl } from '../types/index.js'
import invokeCFBypass from '../utils/invokeCFBypass.js'
import { extractIntFromSting } from '../utils/extractNumber.js'

class UAKinoClubProvider extends Provider {
  protected searchScope = '.movie-item'
  protected searchSelector: SearchSelector = {
    name: '.movie-title',
    id: {
      selector: '.movie-title',
      transform: ($el: Cheerio<AnyNode>): string => urlencode($el.attr('href') ?? '')
    },
    image: {
      selector: '.movie-img img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('src') ?? '')
    }
  }
  protected infoSelectors: InfoSelectors = {
    title: '.solototle',
    image: {
      selector: '.film-poster>a',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('href') ?? '')
    },
    files: {
      selector: ['.players-section .playlists-ajax', '.players-section iframe'],
      transform: ($el: Cheerio<AnyNode>): Promise<File[]> | File[] => {
        if ($el.is('.players-section iframe')) {
          return this.extractPageV1($el)
        } else if ($el.is('.playlists-ajax')) {
          return this.extractPageV2($el)
        } else {
          return []
        }
      }
    },
    trailer: {
      selector: 'div#overroll',
      transform: ($el: Cheerio<AnyNode>): string | undefined => {
        const src = $el.toArray()
          .map((el) => $(el).attr('src'))
          .find((src) => src?.search('youtube') != 1)

        return src
      }
    }
  }

  constructor() {
    super('uakinoclub', providerConfig.providers.uakinoclub)
  }

  private extractPageV1($el: Cheerio<AnyNode>): File[] {
    const url = $el.attr('src')

    if (!url) return []

    return [{
      id: 0,
      name: null,
      urls: [{
        url: url,
        extractor: { type: 'ashdi' },
        hls: true
      }]
    }]
  }

  private async extractPageV2($el: Cheerio<AnyNode>): Promise<File[]> {
    const newsId = $el.attr('data-news_id')
    const res = await invokeCFBypass(`${this.config.baseUrl}/engine/ajax/playlists.php?news_id=${newsId}&xfield=playlist`)

    const files: File[] = []
    const response = JSON.parse(res.text) as { response: string }
    const $playlist = $(response.response)

    const audios = $playlist.find('.playlists-lists .playlists-items:nth-child(0) li')
      .toArray()
      .map((el) => {
        const $el = $(el)

        return {
          audio: $el.text(),
          prefix: $el.attr('data-id')!
        }
      })

    const fileById: Record<number, File> = {}

    $playlist.find('.playlists-videos .playlists-items li')
      .toArray()
      .forEach((el, id) => {
        const $el = $(el)
        const audioId = $el.attr('data-id')
        const episodeId = extractIntFromSting($el.text())
        const url = $el.attr('data-file')!
        let audio = null

        if (audioId) {
          audio = audios.find(({ prefix }) => audioId.startsWith(prefix))?.audio ?? null
        }

        if (episodeId) {
          id = episodeId - 1
        }

        const file = fileById[id] ?? {
          id,
          name: `Episode ${id + 1}`,
          urls: []
        }

        files[id] = file
        const fileUrl: FileUrl = {
          url: url,
          extractor: { type: 'ashdi' },
          hls: true
        }

        if (audio) fileUrl.audio = audio

        file.urls!.push(fileUrl)
      })

    return files
  }
}

export default UAKinoClubProvider