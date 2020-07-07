module.exports = {
    'timeout': 5,
    'infoTimeout': 11,
    'pageSize': 15,
    'videocdn': {
        'baseUrl': 'https://videocdn.tv/api',
        'types': ['tv-series', 'movies', 'show-tv-series', 'animes', 'anime-tv-series'],
        'token': 'VPqJBfTMlSJfe3NeGanYjpvH2iky0SUE'
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
        'baseUrl': 'https://online.anidub.com/',
        'searchUrl': 'https://online.anidub.com/index.php?do=search',
    },
    'animedia': {
        'baseUrl': 'https://online.animedia.pro',
        'searchUrl': 'https://online.animedia.pro//ajax/search_result_search_page_2/P0'
    },
    'kinovod': {
        'baseUrl': 'http://kinovod129.cc',
        'searchUrl': 'http://kinovod129.cc/search'
    },
    'animevost': {
        'baseUrl': 'https://animevost.org',
        'searchUrl': 'https://animevost.org/index.php?do=search'
    },
    'kinogo': {
        'baseUrl': 'https://kinogo.by',
        'searchUrl': 'https://kinogo.by/index.php?do=search'
    },
    'baskino': {
        'baseUrl': 'http://baskino.me',
        'searchUrl': 'http://baskino.me'
    },
    'seasonvar': {
        'encryptKey': 'ololo',
        'baseUrl': 'http://seasonvar.ru',
        'searchUrl': 'http://seasonvar.ru/search'
    },
    'exfs': {
        'baseUrl': 'http://ex-fs.net',
        'searchUrl': 'http://ex-fs.net'
    },     
    '7serealov': {
        'baseUrl': 'http://7serialov.net',
        'searchUrl': 'https://7serialov.net'
    }
}