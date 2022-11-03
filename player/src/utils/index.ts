import { Playlist } from '../types'
import { base64UrlEncode } from './base64'

export const animeBot = 'anime_tube_bot'
export const moviesBot = 'MoviesBroBot'
export const uaBot = 'UAMoviesBot'
export const tgBots = [animeBot, uaBot, moviesBot]

export const isTouchDevice = (): boolean => {
  if ('ontouchstart' in document.documentElement) {
    return true
  }

  if (window.matchMedia) {
    const isMobile = window.matchMedia('only screen and (max-width: 570px)')
    return isMobile.matches
  }

  return false
}

export const toHHMMSS = (timestamp: number): string => {
  if (isNaN(timestamp)) return ''

  const hours = Math.floor(timestamp / 3600)
  const minutes = Math.floor((timestamp - (hours * 3600)) / 60)
  const seconds = Math.floor(timestamp - (hours * 3600) - (minutes * 60))

  let hoursStr: string = hours.toString()
  let minutesStr: string = minutes.toString()
  let secondsStr: string = seconds.toString()

  if (hours < 10) {
    hoursStr = '0' + hours
  }
  if (minutes < 10) {
    minutesStr = '0' + minutes
  }
  if (seconds < 10) {
    secondsStr = '0' + seconds
  }

  if (hours > 0) {
    return hoursStr + ':' + minutesStr + ':' + secondsStr
  } else {
    return minutesStr + ':' + secondsStr
  }
}

export const getPlaylistPrefix = (playlist: Playlist): string =>
  `playlist:${playlist.provider}:${playlist.id}`


export const download = (path: string, filename: string): void => {
  const anchor = document.createElement('a')
  anchor.href = path
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}

export const getAlternativeUrl = (provider: string, query: string): string => {
  let bot
  if (provider.startsWith('ani')) {
    bot = animeBot
  } else if (provider.startsWith('ua')) {
    bot = uaBot
  } else {
    switch (provider) {
      case 'eneyida':
        bot = uaBot
        break
      default:
        bot = moviesBot
    }
  }


  return `https://t.me/${bot}?start=${encodeURIComponent(base64UrlEncode(query))}`
}