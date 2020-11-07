module.exports = {
    'timeout': 5,
    'infoTimeout': 11,
    'pageSize': 15,
    'videocdn': {
        'baseUrl': 'https://videocdn.tv/api',
        'types': ['tv-series', 'movies', 'show-tv-series', 'animes', 'anime-tv-series'],
        'token': 'VPqJBfTMlSJfe3NeGanYjpvH2iky0SUE',
        'infoTimeout': 30
    },
    'nekomori': {
        'baseUrl': 'https://api.nekomori.ch',
        'postersCDNUrl': 'https://cdn.nekomori.ch/art/poster',
        'playersConfig': {
            'Sibnet': { 'extractor': 'sibnetmp4' },
            'Kodik': { 'extractor': 'anigit' }
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
        'baseUrl': 'https://anigato.ru/',
        'searchUrl': 'https://anigato.ru/index.php?do=search',
        'token': '447d179e875efe44217f20d1ee2146be'
    },
    'kinovod': {
        'baseUrl': 'https://kinovod183.cc',
        'searchUrl': 'https://kinovod183.cc/ajax/search.php'
    },
    'animevost': {
        'baseUrl': 'https://animevost.org',
        'searchUrl': 'https://animevost.org/index.php?do=search'
    },
    'kinogo': {
        'baseUrl': 'https://kinogo.by',
        'searchUrl': 'https://kinogo.by/index.php?do=search',
        'infoTimeout': 30
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