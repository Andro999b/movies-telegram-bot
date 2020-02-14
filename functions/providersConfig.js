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
            'Sibnet': { 'extractor': 'sibnet', 'hls': true },
            'AniMedia': { 'extractor': 'animedia', 'hls': true }
        }
    },
    'yummy': {
        'baseUrl': 'https://yummyanime.club',
        'searchUrl': 'https://yummyanime.club/search'
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
    'kinoukr': {
        'baseUrl': 'https://kinoukr.com',
        'searchUrl': 'https://kinoukr.com'
    },
    'kino4ua': {
        'baseUrl': 'https://kino4ua.net',
        'searchUrl': 'https://kino4ua.net'
    },
    'uaserials': {
        'password': '297796CCB81D2551',
        'baseUrl': 'https://uaserials.pro',
        'searchUrl': 'https://uaserials.pro'
    },
    '7serealov': {
        'baseUrl': 'http://7serialov.net',
        'searchUrl': 'http://7serialov.net/search/'
    }
}