const crawler = require('../utils/crawler')
const PROVIDERS_CONFIG= require('../providersConfig')
const urlencode = require('urlencode')

class Provider {
    constructor(name, config) {
        this.name = name
        this.config = Object.assign(
            {
                ...PROVIDERS_CONFIG[name],
                pageSize: PROVIDERS_CONFIG[name].pageSize || PROVIDERS_CONFIG.pageSize || 5,
                timeout: (PROVIDERS_CONFIG[name].timeout || PROVIDERS_CONFIG.timeout || 10) * 1000,
                infoTimeout: (PROVIDERS_CONFIG[name].infoTimeout || PROVIDERS_CONFIG.infoTimeout || 10) * 1000,
                scope: '',
                slectors: {},
                pagenatorSelector: '',
                headers: {
                    'User-Agent': 'Mozilla/5.0 Gecko/20100101 Firefox/59.0'
                },
                detailsScope: 'body'
            },
            config
        )
    }

    async search(query, page, pageCount) {
        if (page < 1) page = 1
        if (pageCount < 1) pageCount = 1

        const name = this.getName()
        const {
            scope,
            selectors,
            pagenatorSelector,
            headers,
            pageSize,
            timeout,
            realip,
            cfbypass
        } = this.config

        const limit = pageCount * pageSize

        query = this._prepareQuery(query)

        let results = await crawler
            .get(
                this.getSearchUrl(query, page),
                this._crawlerSearchRequestGenerator(query, page)
            )
            .cfbypass(cfbypass)
            .headers(headers)
            .realip(realip)
            .scope(scope)
            .timeout(timeout)
            .set(selectors)
            .paginate(pagenatorSelector)
            .limit(limit)
            .gather()

        results = await this._postProcessResult(results)

        return results
            .filter((item) => item.id)
            .map((item) => {
                item.provider = name
                return item
            })
    }

    async getInfo(resultsId) {
        const { 
            detailsScope, 
            detailsSelectors, 
            headers, 
            infoTimeout,
            realip,
            cfbypass
        } = this.config

        let details = await crawler
            .get(
                this.getInfoUrl(resultsId), 
                this._crawlerInfoRequestGenerator(resultsId)
            )
            .cfbypass(cfbypass)
            .timeout(infoTimeout)
            .limit(1)
            .headers(headers)
            .realip(realip)
            .scope(detailsScope)
            .set(detailsSelectors)
            .gather()

        details = details[0]
        details = await this._postProcessResultDetails(details, resultsId)
        details = {
            ...details,
            provider: this.getName(),
            id: resultsId
        }

        return details
    }

    _prepareQuery(query) {
        return query.replace(/[^a-zA-Z0-9\u0400-\u04FF]+/g, ' ')
    }

    // eslint-disable-next-line no-unused-vars
    getSearchUrl(query, page) {
        throw new Error('Provider do not implement getSearchUrl()')
    }

    getName() {
        const { subtype } = this.config
        return `${this.name}${subtype ? '-' + subtype : ''}`
    }

    async _postProcessResult(results) {
        results.forEach((result) => {
            result.infoUrl = this.getInfoUrl(result.id)
            if (result.seeds) result.seeds = parseInt(result.seeds)
            if (result.leechs) result.leechs = parseInt(result.leechs)
        })
        return results
    }

    async _postProcessResultDetails(details) {
        details.files = details.files || []

        if (details.files.length == 1) {
            const file = details.files[0]
            if(!file.name) file.name = details.title
        }

        return details
    }

    _crawlerSearchRequestGenerator(query, page) { } // eslint-disable-line

    _crawlerInfoRequestGenerator(resultsId) { } // eslint-disable-line

    getType() {
        return 'directMedia'
    }

    getInfoUrl(resultsId) {
        const url = urlencode.decode(resultsId)

        if(url.startsWith('http')) {
            if(url.startsWith(this.config.baseUrl)){
                return url
            } else {
                return url.replace(/https?:\/\/[a-z0-9.]+/, this.config.baseUrl)
            }
        }

        return this.config.baseUrl + url
    }

    async getSource(resultsId, sourceId) {// eslint-disable-line
        return {}
    }

    _absoluteUrl(url) {
        return url.startsWith('/') ? this.config.baseUrl + url : url
    }
}

module.exports = Provider
