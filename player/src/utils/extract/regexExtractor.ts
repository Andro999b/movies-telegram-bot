import { ExtractFun, Pattern } from '.'

const regexExtractor = (patterns: Array<Pattern | RegExp | string>): ExtractFun =>
  async (url: string): Promise<string> => {
    const targetUrl = url.startsWith('//') ? 'https:' + url : url

    const res = await fetch(targetUrl)
    const content = await res.text()

    for (const pattern of patterns) {
      let expression
      let transform = (m: Array<string>): string => m[m.length - 1]

      if (pattern instanceof RegExp) {
        expression = pattern
      } else if (typeof pattern === 'string') {
        expression = new RegExp(pattern)
      } else {
        expression = pattern.expression
        transform = pattern.transform
      }

      const matches = content.match(expression)

      if (matches == null || matches.length < 1)
        continue

      return transform(matches)
    }

    throw Error(`Cant extract media from url: ${url}`)
  }

export default regexExtractor
