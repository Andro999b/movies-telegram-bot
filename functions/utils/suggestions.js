const superagent = require('superagent')
const $ = require('cheerio')

const googleSuggestion = async (searchQuery) => { // eslint-disable-line
    try {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
        const res = await superagent
            .get(searchUrl)
            .set({
                'User-Agent': 'Mozilla/5.0 Gecko/20100101 Firefox/78.0',
                'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3'
            })

        const $page = $(res.text)
        const suggestion = $page.find('p.card-section a').eq(0).text()

        return suggestion ? [suggestion] : []
    } catch (e) {
        console.error(`Fail to fetch suggestion from google for: ${searchQuery}`, e)
    }

    return []
}

const yandexSuggestion = async (searchQuery) => { // eslint-disable-line
    try {
        const searchUrl = `https://yandex.ru/search/?text=${encodeURIComponent(searchQuery)}`
        const res = await superagent
            .get(searchUrl)
            .set({
                'User-Agent': 'Mozilla/5.0 Gecko/20100101 Firefox/78.0',
                'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3'
            })

        const $page = $(res.text)
        const s2 = $page.find('.misspell__message a').first().text()

        return [s2].filter((it) => it)
    } catch (e) {
        console.error(`Fail to fetch suggestion from yandex for: ${searchQuery}`, e)
    }

    return []
}

const yandexSpellerSuggestion = async (searchQuery) => { // eslint-disable-line
    try {
        // const searchUrl = `https://corsproxy.movies-player.workers.dev/?https://speller.yandex.net/services/spellservice.json/checkText?text=${encodeURIComponent(searchQuery)}`
        const searchUrl = `https://speller.yandex.net/services/spellservice.json/checkText?text=${encodeURIComponent(searchQuery)}`
        const res = await superagent.get(searchUrl)

        const corrections = JSON.parse(res.text)
        if(corrections.length == 0) return []

        function getCorrectionsVariants(i = 0) { // eslint-disable-line no-inner-declarations
            let { pos, len, s } = corrections[i]

            let variants = s.map((word) => ({
                pos,
                len,
                word
            }))

            if(i < corrections.length - 1) {
                const subvariants = getCorrectionsVariants(i + 1)
                const newvariants = []

                subvariants.forEach((i) => {
                    variants.forEach((j) => {
                        newvariants.push([j].concat(i))
                    })
                })

                return newvariants
            }

            return variants
        }

        function putСorrection(correction) { // eslint-disable-line no-inner-declarations
            let prev = 0
            const parts = []
            correction.forEach(({ pos, len }) => {
                const cut = [prev, pos]
                prev = prev + len + 1
                parts.push(searchQuery.substring(cut[0], cut[1]))
            })

            parts.push(searchQuery.substring(prev))

            let result = ''
            parts.forEach((val, index) => {
                result += val
                if(index < correction.length)
                    result += correction[index].word
            })

            return result.trim()
        }

        return getCorrectionsVariants().map((correction) => putСorrection(correction))
    } catch (e) {
        console.error(`Fail to fetch suggestion from yandex speller for: ${searchQuery}`, e)
    }
}

module.exports = async (searchQuery) => 
    yandexSpellerSuggestion(searchQuery.replace(/[^a-zA-Z0-9\u0400-\u04FF]+/g, ' '))