const Fuse = require('fuse.js')

const FUZZY_MATCH_SCORE = process.env.FUZZY_MATCH_SCORE || 0.5

class Library {

    constructor() {
        const options = { keys: ['name'], includeScore: true }
        this.typeSearcher = new Fuse(this._getTypeData(), options)
        this.genreSearcher = new Fuse(this._getGenreData(), options)
        this.countrySearcher = new Fuse(this._getCountryData(), options)
    }

    _parseQuery(query) {
        query = query.replace(/[^a-zA-Z0-9\u0400-\u04FF]+/g, ' ').trim()

        const keywords = query.split(/\s+/)

        let type = null, 
            typeName = null, 
            genre = null, 
            genreName = null, 
            fromYear = null, 
            toYear = null, 
            country = null,
            countryName = null,
            page = 1

        const getYear = (k) => {
            if (!isNaN(k)) {
                const year = parseInt(k)
                if (year > 1900 && year <= (new Date()).getFullYear()) {
                    return year
                }
            }

            return null
        }

        for (const keyword of keywords) {
            const year = getYear(keyword)

            if(year) {
                if (!fromYear) {
                    fromYear = year
                    continue
                }
                
                if (!toYear) {
                    toYear = year
                    continue
                }
            }

            if(keyword.startsWith('page')) {
                const p = keyword.substr(4)
                if(!isNaN(p)) page = parseInt(p)
                continue
            }

            if (!type) {
                const res = this.typeSearcher.search(keyword)
                if (res[0] && res[0].score < FUZZY_MATCH_SCORE) {
                    typeName = res[0].item.name
                    type = res[0].item.id
                    continue
                }
            }
            
            if (!genre) {
                const res = this.genreSearcher.search(keyword)
                if (res[0] && res[0].score < FUZZY_MATCH_SCORE) {
                    genreName = res[0].item.name
                    genre = res[0].item.id
                    continue
                }
            }

            if (!country) {
                const res = this.countrySearcher.search(keyword)
                if (res[0] && res[0].score < FUZZY_MATCH_SCORE) {
                    countryName = res[0].item.name
                    country = res[0].item.id
                    continue
                }
            }
        }

        if(!type) {
            const { name, id } = this._getDefaultTypeData()
            type = id
            typeName = name
        }

        if(!fromYear) {
            fromYear = (new Date()).getFullYear() - 1
            toYear = (new Date()).getFullYear()
        }

        return { 
            type, 
            typeName, 
            genre, 
            genreName,
            country,
            countryName,
            fromYear, 
            toYear, 
            page 
        }
    }

    async top(query) {
        return this.topByParams(this._parseQuery(query))
    }

    // eslint-disable-next-line no-unused-vars
    async topByParams(params) {}

    async getInfoById(id) {}

    getName() {}
}

module.exports = Library