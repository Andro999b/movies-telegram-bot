import superagent from 'superagent'

interface Correction {
  pos: number
  len: number
  s: string[]
}

interface CorrectionWord {
  pos: number
  len: number
  word: string
}

export default async (searchQuery: string): Promise<string[]> => { // eslint-disable-line
  try {
    const searchUrl = `https://speller.yandex.net/services/spellservice.json/checkText?text=${encodeURIComponent(searchQuery)}`
    const res = await superagent.get(searchUrl)

    const corrections: Correction[] = JSON.parse(res.text)
    if (corrections.length == 0) return []

    function getCorrectionsVariants(i = 0): CorrectionWord[][] { // eslint-disable-line no-inner-declarations
      const { pos, len, s } = corrections[i]

      const variants: CorrectionWord[][] = s.map((word) => ([{
        pos,
        len,
        word
      }]))

      if (i < corrections.length - 1) {
        const subvariants = getCorrectionsVariants(i + 1)
        const newvariants: CorrectionWord[][] = []

        subvariants.forEach((i) => {
          variants.forEach((j) => {
            newvariants.push(j.concat(i))
          })
        })

        return newvariants
      }

      return variants
    }

    function putCorrection(corrections: CorrectionWord[]): string { // eslint-disable-line no-inner-declarations
      let prev = 0
      const parts = []
      corrections.forEach(({ pos, len }) => {
        const cut = [prev, pos]
        prev = pos + len
        parts.push(searchQuery.substring(cut[0], cut[1]))
      })

      parts.push(searchQuery.substring(prev, searchQuery.length))

      let result = ''
      parts.forEach((val, index) => {
        result += val
        if (index < corrections.length)
          result += corrections[index].word
      })

      return result.trim()
    }

    return getCorrectionsVariants().map((correction) => putCorrection(correction))
  } catch (e) {
    console.error(`Fail to fetch suggestion from yandex speller for: ${searchQuery}`, e)
  }

  return []
}