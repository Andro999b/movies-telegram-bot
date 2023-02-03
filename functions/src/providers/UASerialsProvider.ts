import Provider from './CFDataLifeProvider'
import CryptoJS from 'crypto-js'
import urlencode from 'urlencode'
import { AnyNode, Cheerio } from 'cheerio'
import providersConfig from '../providersConfig'
import { File, ProviderConfig } from '../types/index'

interface UASerialsProviderConfig extends ProviderConfig {
  password: string
}


interface Season {
  title: string
  episodes: {
    title: string
    sounds: {
      title: string
      url: string
    }[]
  }[]
}

class UASerialsProvider extends Provider<UASerialsProviderConfig> {
  protected searchScope = '.short-item'
  protected searchSelector = {
    id: {
      selector: '.short-img',
      transform: ($el: Cheerio<AnyNode>): string => urlencode($el.attr('href') ?? '')
    },
    name: '.th-title',
    image: {
      selector: '.short-img img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('src') ?? '')
    }
  }
  protected infoSelectors = {
    title: 'h1.short-title',
    image: {
      selector: '.fimg img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('src') ?? '')
    },
    files: {
      selector: 'player-control',
      transform: ($el: Cheerio<AnyNode>): File[] => {
        const { password } = this.config
        const dataString = $el.attr('data-tag1')

        if (!dataString) return []

        const data = JSON.parse(dataString)

        const encrypted = data.ciphertext
        const salt = CryptoJS.enc.Hex.parse(data.salt)
        const iv = CryptoJS.enc.Hex.parse(data.iv)

        const key = CryptoJS.PBKDF2(password, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64 / 8, iterations: 999 })

        const decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv: iv })
        const tabsObject = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8).replace(/\\/g, ''))
        const playerTab = tabsObject[0]

        if (playerTab.url) {
          return [{
            id: 0,
            name: null,
            urls: [{
              url: playerTab.url,
              hls: true,
              extractor: { type: 'm3u8proxy' }
            }]
          }]
        } else {
          let id = 0
          return playerTab.seasons.flatMap(({ title, episodes }: Season) => {
            return episodes.flatMap((e) => ({
              id: id++,
              name: e.title,
              path: title,
              urls: e.sounds.map((s) => ({
                extractor: { type: 'm3u8proxy' },
                hls: true,
                url: s.url,
                audio: s.title
              }))
            }))
          })
        }
      }
    }
  }

  constructor() {
    super('uaserials', providersConfig.providers.uaserials as UASerialsProviderConfig)
  }
}

export default UASerialsProvider