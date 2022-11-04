import superagent from 'superagent'

export default async (searchQuery) => { // eslint-disable-line
    try {
        // const searchUrl = `https://corsproxy.movies-player.workers.dev/?https://speller.yandex.net/services/spellservice.json/checkText?text=${encodeURIComponent(searchQuery)}`
        const searchUrl = `https://speller.yandex.net/services/spellservice.json/checkText?text=${encodeURIComponent(searchQuery)}`
        const res = await superagent.get(searchUrl)

        const corrections = JSON.parse(res.text)
        if(corrections.length == 0) return []

        function getCorrectionsVariants(i = 0) { // eslint-disable-line no-inner-declarations
            let { pos, len, s } = corrections[i]

            let variants = s.map((word) => ([{
                pos,
                len,
                word
            }]))

            if(i < corrections.length - 1) {
                const subvariants = getCorrectionsVariants(i + 1)
                const newvariants = []

                subvariants.forEach((i) => {
                    variants.forEach((j) => {
                        newvariants.push(j.concat(i))
                    })
                })

                return newvariants
            }

            return variants
        }

        function putCorrection(correction) { // eslint-disable-line no-inner-declarations
            let prev = 0
            const parts = []
            correction.forEach(({ pos, len }) => {
                const cut = [prev, pos]
                prev = pos + len
                parts.push(searchQuery.substring(cut[0], cut[1]))
            })
            
            parts.push(searchQuery.substring(prev, searchQuery.length))

            let result = ''
            parts.forEach((val, index) => {
                result += val
                if(index < correction.length)
                    result += correction[index].word
            })

            return result.trim()
        }

        return getCorrectionsVariants().map((correction) => putCorrection(correction))
    } catch (e) {
        console.error(`Fail to fetch suggestion from yandex speller for: ${searchQuery}`, e)
    }

    return []
}