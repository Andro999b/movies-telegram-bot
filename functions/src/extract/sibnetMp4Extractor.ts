
import regExprExtractor from './regExprExtractor.js'
import superagent from 'superagent'

export default regExprExtractor([{
  expression: /\/[0-9A_Za-z/]+\.mp4/,
  transform: async (matches): Promise<string> => {
    const sibnetUrl = `https://video.sibnet.ru${matches[0]}`

    const res = await superagent
      .head(sibnetUrl)
      .set('Referer', 'https://video.sibnet.ru')
      .redirects(0)
      .ok((res) => res.status == 302)

    const { location } = res.header

    return location.startsWith('//') ? `https:${location}` : location
  }
}])