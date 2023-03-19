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
  imdb_id: string
  kinopoisk_id: string
  worldart_id: string
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
      .map(({ ru_title,  imdb_id,  worldart_id, kinopoisk_id, orig_title, year }) => {
        year = year ? year.split('-')[0] : ''

        let id = ''
        if(imdb_id) {
          id = 'imdb_id-' + imdb_id
        } else if(worldart_id) {
          id = 'worldart_id-' + worldart_id
        } else if(kinopoisk_id) {
          id = 'kinopoisk_id-' + kinopoisk_id
        }

        return {
          provider: this.name,
          id,
          name: `${ru_title} (${year || orig_title})`,
          image: `https://corsproxy.movies-player.workers.dev/?${encodeURIComponent(`https://st.kp.yandex.net/images/film_big/${kinopoisk_id}.jpg`)}`
        }
      })
      .filter(({ id }) => id)

  }

  override async getInfo(typeAndId: string): Promise<Playlist | null> {
    const [type, id] = typeAndId.split('-')

    const { baseUrl, token, infoTimeout, referer } = this.config

    const res = await superagent.get(`${baseUrl}/short/?api_token=${token}&${type}=${id}`)
      .timeout(infoTimeout!)
      .buffer(true)

    const { data } = JSON.parse(res.text)

    if (data.length == 0)
      return null

    const { title, iframe_src, kp_id } = data[0]
    const url = iframe_src.startsWith('//') ? 'https:' + iframe_src : iframe_src

    let files: File[] = []
    try {
      files = (await videocdnembed(url, infoTimeout, referer))
        .map((file, id) => ({ ...file, id: id }))
    } catch (e) {
      console.error('Fail to get files', e)
    }

    const kinopoiskPoster = `https://st.kp.yandex.net/images/film_big/${kp_id}.jpg`


    if (files.length == 1) {
      files[0].name = title
    }

    return {
      id: typeAndId,
      provider: this.name,
      title: title,
      files,
      image: `https://corsproxy.movies-player.workers.dev/?${encodeURIComponent(kinopoiskPoster)}`
    }
  }
}

export default VideoCDNProvider