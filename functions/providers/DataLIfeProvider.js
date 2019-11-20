const Provider = require('./Provider')
const superagent = require('superagent')
const urlencode = require('urlencode')

require('superagent-charset')(superagent)

class DataLifeProvider extends Provider {
    getSearchUrl() {}

    getInfoUrl(resultsId) {
        return urlencode.decode(resultsId)
    }

    _getSiteEncoding() {
        return null
    }

    _crawlerSearchRequestGenerator(query) {
        const { searchUrl, headers, timeout } = this.config
        const encoding = this._getSiteEncoding()

        return () => {
            const request = superagent
                .post(searchUrl)
                .type('form')
                .field({ 
                    do: 'search',
                    subaction: 'search',
                    search_start: 0,
                    full_search: 0,
                    result_from: 1,
                    story: encoding ? urlencode.encode(query, encoding) : query
                })
                .buffer(true)
                .charset()
                .timeout(timeout)
                .set(headers)

            return request
        }
    }
}

module.exports = DataLifeProvider