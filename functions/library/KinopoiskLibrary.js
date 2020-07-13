const Library = require('./Library')
const crawler = require('../utils/crawler')
const genres = require('./genres.json')
const country = require('./country.json')
const { getCache } = require('../cache')

const BASE_URL = 'https://www.kinopoisk.ru'
// const BASE_URL = 'https://corsproxy.movies-player.workers.dev/?https://www.kinopoisk.ru'


module.exports = class KinopoisLibrary extends Library {
    async topByParams(params) {
        const { type, genre, country, fromYear, toYear, page } = params
        const pageSize = 10
        
        const queryParams = {
            'm_act[from_year]': fromYear,
            'm_act[country]': country,
            'm_act[from_to]': toYear,
            'm_act[genre][0]': genre,
            'm_act[type]': type
        }

        let queryParamsJoined = ''

        Object.keys(queryParams).forEach((key) => {
            if(queryParams[key]) {
                queryParamsJoined += `${key}/${queryParams[key]}/`
            }
        })

        const url = `${BASE_URL}/s/type/film/list/1/${queryParamsJoined}perpage/${pageSize}/page/${page}/`

        let results = await crawler
            .get(url)
            .timeout(5000)
            .scope('.element')
            .set({
                id: {
                    selector: '.info > .name > a',
                    transform: ($el) => $el.attr('data-id')
                },
                title: '.info > .name > a',
                year: '.info > .name > .year',
                rating: '.rating',
                image: {
                    selector: '.pic img.flap_img',
                    transform: ($el) => BASE_URL + $el.attr('title')
                }
            })
            .gather()


        results = results.map((it) => ({
            ...it,
            image: it.image.replace('sm_film', 'film_big'),
            title: it.title.replace(/\(.+\)/, '').trim(),
            url: `${BASE_URL}/film/${it.id}`
        }))

        const cache = await getCache('library')
        await cache.putToCacheMultiple(results.map((result) => ({ id: result.id, result })))

        return {
            results,
            params: { ...params, pageSize }
        }
    }

    async getInfoById(id) {
        const cache = await getCache('library')
        const item = await cache.get(id)
        return item && item.result
    }

    getName() {
        return 'Kinopoisk'
    }

    _getDefaultTypeData() {
        return {
            name: 'фильм',
            id: 'film'
        }
    }

    _getTypeData() {
        return [
            this._getDefaultTypeData(),
            {
                name: 'сериал',
                id: 'serial'
            }
        ]
    }

    _getGenreData() {
        return genres
    }    
    
    _getCountryData() {
        return country
    }
}