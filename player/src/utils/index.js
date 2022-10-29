import { base64UrlEncode } from './base64'

export const animeBot = 'anime_tube_bot'
export const moviesBot = 'MoviesBroBot'
export const uaBot = 'UAMoviesBot'
export const tgBots = [animeBot, uaBot, moviesBot]

export function invokeAll() {
  const invockes = Array.from(arguments)
  return function () {
    invockes.forEach((invoke) => {
      invoke.call()
    })
  }
}

export function isTouchDevice() {
  if('ontouchstart' in document.documentElement) {
    return true
  }
    
  if(window.matchMedia) {
    const isMobile = window.matchMedia('only screen and (max-width: 570px)')
    return isMobile.matches
  }

  return false
}

export function toHHMMSS(timestamp) {
  if(isNaN(timestamp)) return ''

  var hours   = Math.floor(timestamp / 3600)
  var minutes = Math.floor((timestamp - (hours * 3600)) / 60)
  var seconds = Math.floor(timestamp - (hours * 3600) - (minutes * 60))

  if (hours   < 10) {
    hours   = '0' + hours
  }
  if (minutes < 10) {
    minutes = '0' + minutes
  }
  if (seconds < 10) {
    seconds = '0' + seconds
  }
    
  if(hours > 0) {
    return hours+':'+minutes+':'+seconds
  } else {
    return minutes+':'+seconds
  }
}

export const getPlaylistPrefix = (playlist) => `playlist:${playlist.provider}:${playlist.id}`


export const download = (path, filename) => {
  const anchor = document.createElement('a')
  anchor.href = path
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}

export function getAlternativeUrl(provider, query) {
  let bot
  if(provider.startsWith('ani')) {
    bot = animeBot
  } else if(provider.startsWith('ua')) {
    bot = uaBot
  } else {
    switch(provider) {
      case 'eneyida':
        bot = uaBot
        break
      default:
        bot = moviesBot
    }
  }
    

  return `https://t.me/${bot}?start=${encodeURIComponent(base64UrlEncode(query))}`
}