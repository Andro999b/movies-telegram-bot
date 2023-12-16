import { ProvidersConfig } from './types/index'

const config: ProvidersConfig = {
  timeout: 5,
  infoTimeout: 20,
  pageSize: 10,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0',
  providers: {
    animevost: {
      baseUrl: 'https://animevost.org',
      searchUrl: 'https://animevost.org/index.php',
      playerUrl: 'https://animevost.org/frame5.php',
    },
    animego: {
      searchUrl: 'https://animego.org/search/anime',
      baseUrl: 'https://animego.org',
      bypassMode: 'proxy',
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
      bypassMode: 'proxy',
      imagesUrl: 'https://anitube.in.ua',
      baseUrl: 'https://anitube.in.ua',
      searchUrl: 'https://anitube.in.ua/index.php',
      // baseUrl: 'https://85.208.185.25',
      // searchUrl: 'https://85.208.185.25/index.php',
      // headers: {
      //   Host: 'anitube.in.ua'
      // }
    },
    animeuaclub: {
      searchUrl: 'https://animeua.club',
      baseUrl: 'https://animeua.club'
    },
    animelib: {
      searchUrl: 'https://animelib.me/search',
      baseUrl: 'https://animelib.me',
      headers: {
        'Cookie': 'remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d=eyJpdiI6InplVEJiVmJ6WlRLZ3hRZHZkeFdFeGc9PSIsInZhbHVlIjoiT1ZyYkozUjNlOEREWDdrQTdhUXRsS2NBZ2EzdG1TTi81ZzhoUFNrSFhuZSs5bEVsOWhBU20vWDhmVG5DbE1PTXozU0tlTUtFZEtuZFVQOU41K0R0a05LU05uMVYySGFPdWVLRWppLytVNGVGU3orWE10ajFyWDVodVo0QXg4MFFHWVFna1J4Rmp4VVMxbTlvQndJUTlNamJ6VWdZTzFuQ0NuZXlwOGxwL0ZOdVdKQXdDRVNDTElFWXl6VGtUa1Z0NHJZNFRWZi9wRVpSY1U0NTJBLzBadXpkQ1pMZmlKbjBOWWd0Z3hLTkg1dz0iLCJtYWMiOiJlOTBmZGQxYzQ5ODMxOWRkZTZmZDczMTBlZWY0OWVhOThkZmVmM2Y3MDVlYzVlMTI5ZjJjOWZkNzAxMzYwYmM2IiwidGFnIjoiIn0%3D'
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
      searchUrl: 'https://eneyida.tv/index.php',
      bypassMode: 'cf'
    },
    uakinoclub: {
      baseUrl: 'https://uakino.club/',
      searchUrl: 'https://uakino.club/index.php',
      bypassMode: 'cf'
    },
    uafilmtv: {
      baseUrl: 'https://uafilm.tv',
      searchUrl: 'https://uafilm.tv/index.php',
      bypassMode: 'cf'
    },
    uaserials: {
      password: '297796CCB81D2551',
      baseUrl: 'https://uaserials.pro',
      searchUrl: 'https://uaserials.pro/index.php',
      bypassMode: 'cf'
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