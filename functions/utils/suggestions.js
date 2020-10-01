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
        const words = searchQuery.split(' ')

        // const searchUrl = `https://corsproxy.movies-player.workers.dev/?https://speller.yandex.net/services/spellservice.json/checkText?text=${encodeURIComponent(searchQuery)}`
        const searchUrl = `https://speller.yandex.net/services/spellservice.json/checkText?text=${encodeURIComponent(searchQuery)}`
        const res = await superagent
            .get(searchUrl)

        const corrections = JSON.parse(res.text)

        if(corrections.length == 0) return []

        corrections.forEach(({ pos, s }) => {
            words[pos] = s
        })

        /* eslint-disable */
        function getCorrected(pos) {
            let word = words[pos]

            if(typeof word == 'string') {
                word = [word]
            }

            if(pos < words.length - 1) {
                const subwords = getCorrected(pos + 1)
                const newwords = []

                subwords.forEach((i) => {
                    word.forEach((j) => {
                        newwords.push([j].concat(i))
                    })
                })

                return newwords
            }

            return word
        }
        /* eslint-enable */

        return getCorrected(0).map((w) => w.join(' '))
    } catch (e) {
        console.error(`Fail to fetch suggestion from yandex speller for: ${searchQuery}`, e)
    }
}

module.exports = yandexSpellerSuggestion