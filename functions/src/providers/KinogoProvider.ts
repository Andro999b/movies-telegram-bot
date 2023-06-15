import Provider from './CFDataLifeProvider'
import superagent from 'superagent'
import videocdnembed from '../utils/iframes/videocdnembed'
import { extractStringProperty } from '../utils/extractScriptVariable'
import { AnyNode, Cheerio } from 'cheerio'
import providersConfig from '../providersConfig'
import { File, FileUrl } from '../types/index'
import { lastPathPartNoExt } from '../utils/url'

interface IframeV1ParseResult {
  iframeHost: string
  csrfToken: string
  playlistPath: string
}

interface IframeV1PlaylistFolder {
  title: string
  file?: { title: string }
  folder: IframeV1PlaylistFolder[]
}

class KinogoProvider extends Provider {
  protected searchScope = 'div.shortstory'
  protected searchSelector = {
    id: {
      selector: '.zagolovki>a:nth-last-child(1)',
      transform: ($el: Cheerio<AnyNode>): string => lastPathPartNoExt($el.attr('href')).split('.')[0]
    },
    name: '.zagolovki>a:nth-last-child(1)',
    image: {
      selector: '.shortimg>div>a>img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteImageUrl($el.attr('src') ?? '')
    }
  }
  protected infoSelectors = {
    title: '.shortstorytitle>h1',
    image: {
      selector: '.fullimg>div>a>img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteImageUrl($el.attr('src') ?? '')
    },
    files: {
      selector: '.box.visible iframe',
      transform: ($el: Cheerio<AnyNode>): Promise<File[]> => {
        const iframeSrc = $el.attr('src')

        if (!iframeSrc) return Promise.resolve([])

        if (iframeSrc.includes('video.kinogo')) {
          return this.extractV2(iframeSrc)
        }

        return this.extractV1(iframeSrc)
      }
    }
  }

  constructor() {
    super('kinogo', providersConfig.providers.kinogo)
  }

  private extractV2(iframeSrc: string): Promise<File[]> {
    return videocdnembed(iframeSrc)
  }

  private async extractV1(iframeSrc: string): Promise<File[]> {
    const { baseUrl, timeout } = this.config
    const { iframeHost, csrfToken, playlistPath } = await KinogoProvider
      .parseIframeV1(iframeSrc, baseUrl, timeout!)

    if (playlistPath.startsWith('~')) {
      let fileUrl = KinogoProvider.getFileUrlV1(iframeHost, playlistPath)

      const fileRes = await superagent.post(fileUrl)
        .set({
          'Referer': `https://${iframeHost}`,
          'X-CSRF-TOKEN': csrfToken
        })
        .buffer()
        .timeout(timeout!)

      fileUrl = fileRes.text

      return [{
        id: 0,
        name: null,
        urls: [{ url: fileUrl, hls: true }]
      }]
    } else {
      const playlistUrl = `https://${iframeHost}${playlistPath}`

      const playlistRes = await superagent.post(playlistUrl)
        .set({
          'Referer': `https://${iframeHost}`,
          'X-CSRF-TOKEN': csrfToken
        })
        .timeout(timeout!)

      const rootFiles = playlistRes.body as IframeV1PlaylistFolder[]
      if (rootFiles.length == 1) {
        return rootFiles[0].folder
          .map(({ title, folder }, fileIndex) => ({
            id: fileIndex,
            name: title,
            urls: this.getUrls(folder, iframeSrc, 0, fileIndex)
          }))
      } else {
        let id = 0
        return rootFiles.flatMap(({ title, folder }, seasonIndex) => {
          const season: string = title
          return folder
            .map(({ title, folder }, fileIndex) => ({
              id: id++,
              path: season,
              name: title,
              urls: this.getUrls(folder, iframeSrc, seasonIndex, fileIndex)
            }))
        })
      }
    }
  }

  private getUrls(folder: IframeV1PlaylistFolder[], iframeSrc: string, seasonIndex: number, fileIndex: number): FileUrl[] {
    return folder
      .filter(({ file }) => file)
      .map(({ title }, urlIndex) => ({
        audio: title,
        url: iframeSrc,
        hls: true,
        extractor: {
          type: 'kinogo',
          params: {
            file: `${seasonIndex},${fileIndex},${urlIndex}`
          }
        }
      }))
  }

  override getSiteEncoding(): string {
    return 'windows-1251'
  }

  static async parseIframeV1(url: string, referer: string, timeout: number): Promise<IframeV1ParseResult> {
    const iframeRes = await superagent.get(url)
      .set({ 'Referer': referer })
      .timeout(timeout)

    const iframeHost = new URL(url).host
    const playlistPath = extractStringProperty(iframeRes.text, 'file')!.replace(/\\/g, '')
    const csrfToken = extractStringProperty(iframeRes.text, 'key')!

    return { iframeHost, csrfToken, playlistPath }
  }

  static getFileUrlV1(iframeHost: string, filePath: string): string {
    return `https://${iframeHost}/playlist/${filePath.substring(1)}.txt`
  }

  override getInfoUrl(id: string): string {
    if (id.startsWith('http')) {
      return super.getInfoUrl(id)
    }

    const { baseUrl } = this.config
    return `${baseUrl}/${id}.html`
  }
}

export default KinogoProvider