module.exports = {
    'timeout': 5,
    'infoTimeout': 20,
    'pageSize': 10,
    'rezka': {
        'cfbypass': true,
        'baseUrl': 'https://corsproxy.movies-player.workers.dev/?https://rezka.ag',
        'searchUrl': 'https://corsproxy.movies-player.workers.dev/?https://rezka.ag/search/?do=search&subaction=search'
    },
    'videocdn': {
        'baseUrl': 'https://videocdn.tv/api',
        'types': ['tv-series', 'movies', 'show-tv-series', 'animes', 'anime-tv-series'],
        'token': 'BuKYUNoUnwQ560ZbZMIaNkFA4eTkIQk7'
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
        'baseUrl': 'https://m43.animedia.pro',
        'searchUrl': 'https://m43.animedia.pro/ajax/search_result_search_page_2/P0'
    },
    'anigato': {
        // 'realip': '31.31.196.64',
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
    // 'kinogo': {
    //     'baseUrl': 'https://kinogo-net.org/v46',
    //     'searchUrl': 'https://kinogo-net.org/v46/index.php?do=search'
    // },
    'kinogo': {
        'infoTimeout': 40,
        'baseUrl': 'https://kinogo.la',
        'searchUrl': 'https://kinogo.la/index.php?do=search'
    },
    'seasonvar': {
        'pageSize': 30,
        'encryptKey': 'ololo',
        'baseUrl': 'http://seasonvar.ru',
        'searchUrl': 'http://seasonvar.ru/autocomplete.php'
    }
}