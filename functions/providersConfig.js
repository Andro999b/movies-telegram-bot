module.exports = {
    'timeout': 5,
    'infoTimeout': 20,
    'pageSize': 15,
    'videocdn': {
        'baseUrl': 'https://videocdn.tv/api',
        'types': ['tv-series', 'movies', 'show-tv-series', 'animes', 'anime-tv-series'],
        'token': 'VPqJBfTMlSJfe3NeGanYjpvH2iky0SUE'
    },
    'nekomori': {
        'baseUrl': 'http://nekomori.ch/api',
        'postersCDNUrl': 'https://cdn.nekomori.ch/art/poster',
        'sourceConfig': {
            'sibnet': { 'extractor': 'sibnetmp4' },
            'anigit': { 'extractor': 'anigit' }
        }
    },
    'anidub': {
        'baseUrl': 'https://anime.anidub.life',
        'searchUrl': 'https://anime.anidub.life/index.php?do=search',
    },
    'animedia': {
        'baseUrl': 'https://m4.animedia.pro',
        'searchUrl': 'https://m4.animedia.pro//ajax/search_result_search_page_2/P0'
    },
    'anigato': {
        // 'realip': '31.31.196.64', //TODO fuck cloudflare
        // 'hostname': 'anigato.ru',
        'baseUrl': 'https://anigato.org/',
        'searchUrl': 'https://anigato.org/index.php?do=search',
        'token': '447d179e875efe44217f20d1ee2146be'
    },
    'kinovod': {
        'baseUrl': 'https://kinovod230.cc',
        'searchUrl': 'https://kinovod230.cc/search'
    },
    'animevost': {
        'baseUrl': 'https://animevost.org',
        'searchUrl': 'https://animevost.org/index.php?do=search',
        'playerUrl': 'https://play.animegost.org',
    },
    'kinogo': {
        'baseUrl': 'https://kinogo.appspot.com',
        'searchUrl': 'https://kinogo.appspot.com/index.php?do=search'
    },
    'kinogo2': {
        'baseUrl': 'https://kinogo.cc',
        'searchUrl': 'https://kinogo.cc/index.php?do=search'
    },
    'seasonvar': {
        'encryptKey': 'ololo',
        'baseUrl': 'http://seasonvar.ru',
        'searchUrl': 'http://seasonvar.ru/autocomplete.php'
    },
    '7serealov': {
        'baseUrl': 'http://7serialov.net',
        'searchUrl': 'https://7serialov.net'
    }
}