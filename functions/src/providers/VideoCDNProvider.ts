import Provider from './Provider'
import superagent from 'superagent'
import videocdnembed from '../utils/videocdnembed'
import providersConfig from '../providersConfig'
import { File, Playlist, ProviderConfig, SearchResult } from '../types/index'

interface VideoCDNProviderConfig extends ProviderConfig {
  types: string[]
  token: string
  iframe: string
  referer: string
}

interface VideoCDNItem {
  id: number
  ru_title: string
  kinopoisk_id: number
  orig_title: string
  type: string
  year: string
}

interface VideoCDNItemWithType extends VideoCDNItem {
  type: string
}

class VideoCDNProvider extends Provider<VideoCDNProviderConfig> {
  constructor() {
    super(
      'videocdn',
      providersConfig.providers.videocdn as VideoCDNProviderConfig
    )
  }

  override async search(query: string): Promise<SearchResult[]> {
    const { baseUrl, token, types, timeout, pageSize } = this.config

    query = this.prepareQuery(query)

    const promices = types.map(async (type) => {
      // const ordering = 'id'//type.endsWith('series') ? 'last_episode_accepted' : 'last_media_accepted'
      // switch(type) {
      //   case 'animes':
      //   case 'movies':
      //     ordering = 'released'
      //     break
      //   case 'tv-series':
      //   case 'show-tv-series':
      //   case 'anime-tv-series':
      //     ordering = 'start_date'
      //     break
      // }

      try {
        const res = await superagent
          .get(`${baseUrl}/${type}?direction=desc&field=title&limit=${pageSize}&query=${encodeURIComponent(query)}&api_token=${token}`)
          .timeout(timeout!)
          .buffer(true)
          .ok((r) => r.statusCode == 200 || r.statusCode == 404)

        if(res.statusCode == 404) {
          return { items: [], type }
        }

        return { items: JSON.parse(res.text).data, type }
      } catch (e) {
        console.error(`videocdn api fail for type ${type}`, e.message)
      }
      return { items: [], type }
    })

    const results = await Promise.all(promices)

    return results
      .map(({ items, type }) => items.map((item: VideoCDNItem) => ({ ...item, type })))
      .flatMap((it: VideoCDNItemWithType) => it)
      .map(({ id, ru_title, kinopoisk_id, orig_title, type, year }) => {
        year = year ? year.split('-')[0] : ''
        return {
          provider: this.name,
          id: `${type}_${id}`,
          name: `${ru_title} (${year || orig_title})`,
          image: `https://corsproxy.movies-player.workers.dev/?${encodeURIComponent(`https://st.kp.yandex.net/images/film_big/${kinopoisk_id}.jpg`)}`
        }
      })
  }

  override async getInfo(typeAndId: string): Promise<Playlist | null> {
    const [type, id] = typeAndId.split('_')

    const { baseUrl, token, infoTimeout, referer } = this.config

    const res = await superagent.get(`${baseUrl}/${type}?api_token=${token}&id=${id}`)
      .timeout(infoTimeout!)
      .buffer(true)

    const { data } = JSON.parse(res.text)

    if (data.length == 0)
      return null

    const { ru_title, iframe_src, kinopoisk_id } = data[0]
    const url = iframe_src.startsWith('//') ? 'https:' + iframe_src : iframe_src

    let files: File[] = []
    try {
      files = (await videocdnembed(url, infoTimeout, referer))
        .map((file, id) => ({ ...file, id: id }))
    } catch (e) {
      console.error('Fail to get files', e)
    }

    const kinopoiskPoster = `https://st.kp.yandex.net/images/film_big/${kinopoisk_id}.jpg`


    if (files.length == 1) {
      files[0].name = ru_title
    }

    return {
      id: typeAndId,
      provider: this.name,
      title: ru_title,
      files,
      image: `https://corsproxy.movies-player.workers.dev/?${encodeURIComponent(kinopoiskPoster)}`
    }
  }
}

export default VideoCDNProvider