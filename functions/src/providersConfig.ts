import { ProvidersConfig } from './types/index'

const config: ProvidersConfig = {
  timeout: 5,
  infoTimeout: 20,
  pageSize: 10,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0',
  providers: {
    animedia: {
      baseUrl: 'https://online.animedia.tv',
      searchUrl: 'https://online.animedia.tv/ajax/search_result_search_page_2/P0'
    },
    animevost: {
      baseUrl: 'https://animevost.org',
      searchUrl: 'https://animevost.org/index.php',
      playerUrl: 'https://animevost.org/frame5.php',
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
    animeuaclub: {
      searchUrl: 'https://animeua.club',
      baseUrl: 'https://animeua.club'
    },
    animelib: {
      searchUrl: 'https://animelib.me/search',
      baseUrl: 'https://animelib.me',
      headers: {
        'Cookie': 'mangalib_session=eyJpdiI6IndEMm1UaTZSVkpDbG5kVGVVN3VnRlE9PSIsInZhbHVlIjoiY0YyeDZPdy8wY0oxajhKUHY5cFNUeER3blo1aDRlRmtUTFJscDRBcVlISHM1eE5xbk4vMDFmN2FvSjhRZk5KVzEyUHAxUDhIcE91cUJhZFNIS0F3TTE3eVFZS2NnS2tvRlBURk1yeHl5djV6dkJkdmg4MGEwWm9ZSG5KNVFlQnkiLCJtYWMiOiJhMzFhZDM5ZjNiYmI1YTcxYjI5MTc0NWEyNDVjMmEyZDdkZmEyY2NhYmM1YjNiNmE2MGM1ZDE3ZTQ1ZGI3M2QyIiwidGFnIjoiIn0%3D;'
      },
      kodikSign: {
        d: 'animelib.me',
        d_sign: '5ad5c470aa204c917a88f1547d23131691be0636a4dd9f2f837cc16e8d99b294',
        pd: 'kodik.info',
        pd_sign: '09ffe86e9e452eec302620225d9848eb722efd800e15bf707195241d9b7e4b2b',
        ref: 'https%3A%2F%2Fanimelib.me%2F',
        ref_sign: '0c27eeb7e79de496a774e1d5321bd7295fec2310576fe37643c8a145a0a9e43b',
      },
      bypassMode: 'proxy'
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
    },
    kinogo: {
      infoTimeout: 20,
      baseUrl: 'https://kinogo.la',
      searchUrl: 'https://kinogo.la/index.php'
    },
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
    }
  }
}

export default config