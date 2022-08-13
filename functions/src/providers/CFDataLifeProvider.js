const Provider = require('./Provider')
const urlencode = require('urlencode')
const invokeCFBypass = require('../utils/invokeCFBypass')

class DataLifeProvider extends Provider {
    getSearchUrl() {}

    _getSiteEncoding() {
        return 'utf8'
    }

    _crawlerSearchRequestGenerator(query) {
        const { searchUrl, headers } = this.config
        const encoding = this._getSiteEncoding()

        return () => {
            return invokeCFBypass(
                searchUrl, 
                'post', 
                { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' }, 
                `do=search&subaction=search&story=${urlencode.encode(query, encoding)}`
            )
        }
    }

    _crawlerInfoRequestGenerator() { 
        return (url) => {
            return invokeCFBypass(url)
        }
    } 
}

module.exports = DataLifeProvider