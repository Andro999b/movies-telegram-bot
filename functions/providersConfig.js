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
            'Sibnet': { 'extractor': 'sibnetmp4', 'hls': false },
            // 'AniMedia': { 'extractor': 'animedia', 'hls': true },
            // 'Stormo': { 'extractor': 'stormo', 'hls': false },
            // 'Stormo.TV': { 'extractor': 'stormo', 'hls': false },
            'Kodik': { 'extractor': 'anigit', 'hls': false }
        }
    },
    'animego': {
        'baseUrl': 'https://animego.org',
        'searchUrl': 'https://animego.org/search/anime'
    },
    'yummy': {
        'baseUrl': 'https://yummyanime.club',
        'searchUrl': 'https://yummyanime.club/search'
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