import Provider from './Provider'
import urlencode from 'urlencode'
import invokeCFBypass from '../utils/invokeCFBypass'

class DataLifeProvider extends Provider {
    getSearchUrl() { }

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

export default DataLifeProvider