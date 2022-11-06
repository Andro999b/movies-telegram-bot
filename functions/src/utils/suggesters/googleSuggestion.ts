import superagent from 'superagent'
import { load } from 'cheerio'
import providersConfig from '../../providersConfig.js'

export default async (searchQuery: string): Promise<string[]> => { // eslint-disable-line
  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
    const res = await superagent
      .get(searchUrl)
      .set({
        'User-Agent': providersConfig.userAgent,
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3'
      })

    const $page = load(res.text)
    const suggestion = $page('p.card-section a').eq(0).text()

    return suggestion ? [suggestion] : []
  } catch (e) {
    console.error(`Fail to fetch suggestion from google for: ${searchQuery}`, e)
  }

  return []
}