const cheerio = require('cheerio')
const superagent = require('superagent')

require('superagent-charset')(superagent)

cheerio.prototype[Symbol.iterator] = function* () {
    for (let i = 0; i < this.length; i += 1) {
        yield this[i]
    }
}

class Crawler {
    constructor(url, requestGenerator) {
        this._requestGenerator = requestGenerator || (async (nextUrl) => {
            const targetUrl = nextUrl != this._url ?
                new URL(nextUrl, this._url).toString() :
                nextUrl

            return superagent
                .get(targetUrl)
                .buffer(true)
                .charset()
                .timeout(this._timeoutMs)
                .set(this._headers)
        })
        this._url = url
        this._useProxy = false
    }

    headers(headers) {
        this._headers = headers
        return this
    }

    scope(scope) {
        this._scope = scope
        return this
    }

    set(selectors) {
        this._selectors = selectors
        return this
    }

    paginate(pagenatorSelector) {
        this._pagenatorSelector = pagenatorSelector
        return this
    }

    limit(limit) {
        this._limit = limit
        return this
    }

    timeout(ms) {
        this._timeoutMs = ms
        return this
    }

    async _extractData($el, $root, config) {
        let transform = ($el) => $el.text().trim()
        let selector = config

        if (typeof selector !== 'string') {
            transform = config.transform
            selector = config.selector
        }

        $el = selector ? $el.find(selector) : $el

        if ($el.length) {
            return transform($el, $root)
        } else {
            return null
        }
    }

    async gather() {
        if (!this._scope) {
            throw Error('No scope selected')
        }

        if (!this._selectors) {
            throw Error('No selectors set')
        }

        const results = []

        const step = async (currentUrl) => {
            console.log(currentUrl);


            const res = await this._requestGenerator(currentUrl)

            const $ = cheerio.load(res.text, { xmlMode: false })

            const nextUrl =
                this._pagenatorSelector &&
                $(this._pagenatorSelector).attr('href')

            let limitReached = false

            for (const el of $(this._scope)) {
                const item = {}

                for (const selectorName in this._selectors) {
                    const selector = this._selectors[selectorName]
                    item[selectorName] = await this._extractData($(el), $.root(), selector)
                }

                results.push(item)

                if (this._limit && results.length >= this._limit) {
                    limitReached = true
                    break
                }
            }

            if (!nextUrl || limitReached) {
                return results.slice(0, this._limit)
            }

            return step(nextUrl)
        }

        return step(this._url)
    }
}

module.exports = {
    Crawler,
    get(url, requestGenerator) {
        return new Crawler(url, requestGenerator)
    }
}
