const Provider = require('./Provider')
const superagent = require('superagent')
const urlencode = require('urlencode')

require('superagent-charset')(superagent)

class DataLifeProvider extends Provider {
    getSearchUrl() {}

    _getSiteEncoding() {
        return null
    }

    _customizeSearchFormFields(formFiled) { // eslint-disable-line

    }

    _crawlerSearchRequestGenerator(query) {
        const { searchUrl, headers, timeout } = this.config
        const encoding = this._getSiteEncoding()

        return () => {
            const formFields = { 
                do: 'search',
                subaction: 'search',
                search_start: 0,
                full_search: 0,
                result_from: 1,
                story: encoding ? urlencode.encode(query, encoding) : query
            }

            this._customizeSearchFormFields(formFields)

            const request = superagent
                .post(searchUrl)
                .type('form')
                .field(formFields)
                .buffer(true)
                .charset()
                .timeout(timeout)
                .set(headers)

            return request
        }
    }
}

module.exports = DataLifeProvider