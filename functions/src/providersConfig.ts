import { ProvidersConfig } from './types/index'

const config: ProvidersConfig = {
  timeout: 5,
  infoTimeout: 20,
  pageSize: 10,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0',
  providers: {
    videocdn: {
      pageSize: 20,
      baseUrl: 'https://videocdn.tv/api',
      searchUrl: 'https://videocdn.tv/api',
      referer: 'https://videocdn.tv/',
      types: ['tv-series', 'movies', 'show-tv-series', 'animes', 'anime-tv-series'],
      iframe: '83.annacdn.cc',
      token: 'birzMxRwbHzYZSaRGe0ApcXgMbcNersl'// reserv      
      // iframe: '89.annacdn.cc',
      // token: 'wwwKfKgQ9PrIR6jX3ZILT6W10ymHsMt9'
    },
    animedia: {
      baseUrl: 'https://online.animedia.tv',
      searchUrl: 'https://online.animedia.tv/ajax/search_result_search_page_2/P0'
    },
    anigato: {
      timeout: 15,
      bypassMode: 'cf',
      baseUrl: 'https://anigato.ru/',
      searchUrl: 'https://anigato.ru/index.php',
      token: '447d179e875efe44217f20d1ee2146be',
      kodikSign: {
        d: 'anigato.ru',
        d_sign: 'cf40e6e20f1db41da51ba9838a01f05bf7f861eb799fedc164f63e83c660de25',
        pd: 'kodik.info',
        pd_sign: '09ffe86e9e452eec302620225d9848eb722efd800e15bf707195241d9b7e4b2b',
        ref: 'https://anigato.ru/',
        ref_sign: '751d0cd2bc5db44f9d47f30cc5ac3eace8dac460ad9b16399ef5c938b0c9d290'
      }
    },
    animego: {
      searchUrl: 'https://animego.org/search/anime',
      baseUrl: 'https://animego.org',
      kodikSign: {
        d: 'animego.org',
        d_sign: '6d44aaa5cb9782cd4b3817129bfe9644c54504ad6c16a0e2adf239cde4dc416d',
        pd: 'kodik.info',
        pd_sign: '09ffe86e9e452eec302620225d9848eb722efd800e15bf707195241d9b7e4b2b',
        ref: 'https%3A%2F%2Fanimego.org%2F',
        ref_sign: '8adfdc4c8d7d47d4cc38577496ab4afd6b9540e5f2a7709895b2655c752842e3',
      }
    },
    anitubeua: {
      timeout: 10,
      imagesUrl: 'https://anitube.in.ua',
      baseUrl: 'https://85.208.185.25',
      searchUrl: 'https://85.208.185.25/index.php',
      headers: {
        Host: 'anitube.in.ua'
      }
    },
    kinovod: {
      baseUrl: 'https://kinovod.net',
      searchUrl: 'https://kinovod.net/search'
    },
    animevost: {
      baseUrl: 'https://animevost.org',
      searchUrl: 'https://animevost.org/index.php',
      playerUrl: 'https://animevost.org/frame5.php',
    },
    kinogo: {
      infoTimeout: 20,
      baseUrl: 'https://kinogo.la',
      searchUrl: 'https://kinogo.la/index.php'
    },
    eneyida: {
      baseUrl: 'https://eneyida.tv',
      searchUrl: 'https://eneyida.tv/index.php'
    },
    uakinoclub: {
      baseUrl: 'https://uakino.club/',
      searchUrl: 'https://uakino.club/index.php'
    },
    uafilmtv: {
      baseUrl: 'https://uafilm.tv',
      searchUrl: 'https://uafilm.tv/index.php'
    },
    uaserials: {
      password: '297796CCB81D2551',
      baseUrl: 'https://uaserials.pro',
      searchUrl: 'https://uaserials.pro/index.php'
    },
    gidonline: {
      baseUrl: 'https://gidonline.io',
      searchUrl: 'https://gidonline.io',
      decodeKeys: [
        '@#!@@@##$$@@',
        '$$$####!!!!!!!',
        '@!^^!@#@@$$$$$',
        '^^#@@!!@#!$',
        '^^^^^^##@'
      ]
    },
    rezka: {
      baseUrl: 'https://rezka.ag',
      searchUrl: 'https://rezka.ag/search/?do=search&subaction=search',
      decodeKeys: [
        '$$!!@$$@^!@#$$@',
        '####^!!##!@@',
        '$$#!!@#!@##',
        '@@@@@!##!^^^',
        '^^^!@##!!##'
      ],
      bypassMode: 'proxy'
    }
  }
}

export default config