import Provider from './DataLifeProvider.js'
import urlencode from 'urlencode'
import superagent from 'superagent'
import $, { AnyNode, Cheerio } from 'cheerio'
import providersConfig from '../providersConfig.js'
import { ExtractorTypes, File, FileUrl } from '../types/index.js'
import { ProcessingInstruction } from 'domhandler'

const playesRegExp = /RalodePlayer\.init\((.*),(\[\[.*\]\]),/
const srcRegExp = /src="([^"]+)"/

interface ExtratorConfig {
  type: ExtractorTypes
  hls?: boolean
}

const extractors: Record<string, ExtratorConfig | null> = {
  'ashdi': {
    type: 'ashdi',
    hls: true
  },
  'sibnet': {
    type: 'sibnetmp4'
  },
  'secvideo1': {
    type: 'mp4'
  },
  'csst.online': {
    type: 'mp4'
  },
  'veoh.com': null,
  'tortuga.wtf': {
    type: 'tortuga',
    hls: true
  }
}

class AnitubeUAProvider extends Provider {
  protected searchScope = '.story'
  protected searchSelector = {
    id: {
      selector: '.story_c > h2 > a',
      transform: ($el: Cheerio<AnyNode>): string => urlencode($el.attr('href') ?? '')
    },
    name: '.story_c > h2 > a',
    image: {
      selector: '.story_post > img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('src') ?? '')
    }
  }
  protected override infoScope = '.story'
  protected infoSelectors = {
    title: '.story_c h2',
    image: {
      selector: '.story_post img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('src') ?? '')
    },
    files: {
      selector: ['#VideoConstructor_v3_x_Player', '.playlists-ajax'],
      transform: ($el: Cheerio<AnyNode>): Promise<File[]> | File[] => {
        if ($el.is('#VideoConstructor_v3_x_Player')) {
          return this.filesFromVideoContructor($el)
        } else if ($el.is('.playlists-ajax')) {
          return this.filesFromPlaylistAjax($el)
        } else {
          return []
        }
      }
    },
    trailer: {
      selector: 'a.rollover',
      transform: ($el: Cheerio<AnyNode>): string | undefined => {
        const url = $el.attr('href')
        return url?.replace('youtube.com/watch?v=', 'youtube.com/embed/')
      }
    }
  }

  constructor() {
    super('anitubeua', providersConfig.providers.anitubeua)
  }

  private async filesFromPlaylistAjax($el: Cheerio<AnyNode>): Promise<File[]> {
    // https://anitube.in.ua/1866-legenda-pro-korru-2.htm
    // https://anitube.in.ua/4110-chainsaw-man.html

    const newsId = $el.attr('data-news_id')
    const res = await superagent
      .get(`${this.config.baseUrl}/engine/ajax/playlists.php?news_id=${newsId}&xfield=playlist`)
      .set(this.config.headers!)
      .timeout(5000)
      .disableTLSCerts()

    const files: File[] = []
    const $playlist = $(res.body.response)

    const audios = $playlist.find('.playlists-lists .playlists-items:nth-child(0) li')
      .toArray()
      .map((el) => {
        const $el = $(el)

        return {
          audio: $el.text(),
          prefix: $el.attr('data-id')!
        }
      })

    const audioEpCounter: Record<string, number> = {}

    $playlist.find('.playlists-videos .playlists-items li')
      .toArray()
      .forEach((el, id) => {
        const $el = $(el)
        const audioId = $el.attr('data-id')!
        const url = $el.attr('data-file')!
        let audio = null

        if (audioId) {
          audio = audios.find(({ prefix }) => audioId.startsWith(prefix))?.audio ?? null

          if (audioEpCounter[audioId] !== undefined) {
            id = ++audioEpCounter[audioId]
          } else {
            id = audioEpCounter[audioId] = 0
          }
        }

        const extractorName = Object.keys(extractors).find((extr) => url.indexOf(extr) != -1)

        if (!extractorName)
          return

        this.addFile(files, id, audio, url, extractors[extractorName])
      })

    return files
  }

  private filesFromVideoContructor($el: Cheerio<AnyNode>): File[] {
    const script = $el.prev('script').get()[0].children[0] as ProcessingInstruction
    const matches = script.data.match(playesRegExp)

    if (!matches || matches.length < 1)
      return []

    const audios = JSON.parse(matches[1]) as string[]
    const videos = JSON.parse(matches[2]) as { code: string }[][]

    const files: File[] = []

    videos.forEach((episodes, i) => {
      const audio = audios[i]

      let id = 0
      for (const episode of episodes) {
        const { code } = episode

        const srcMatch = code.match(srcRegExp)

        if (!srcMatch || srcMatch.length < 1)
          return

        const url = srcMatch[1]
        const extractorName = Object.keys(extractors).find((extr) => url.indexOf(extr) != -1)

        if (!extractorName)
          return

        this.addFile(files, id, audio, url, extractors[extractorName])

        id++
      }
    })

    return files
  }

  addFile(files: File[], index: number, audio: string | null, url: string, extractor: ExtratorConfig | null): void {
    const file = files[index] ?? {
      id: index,
      name: `Episode ${index + 1}`,
      urls: []
    }

    files[index] = file
    const fileUrl: FileUrl = { url }
    if (audio) fileUrl.audio = audio

    if (extractor) {
      fileUrl.extractor = { type: extractor.type }
      if (extractor.hls) {
        fileUrl.hls = true
      }
    }
    file.urls!.push(fileUrl)
  }
}

export default AnitubeUAProvider