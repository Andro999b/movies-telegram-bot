import superagent from 'superagent'
import cheerio from 'cheerio'
import providersConfig from '../../providersConfig.js'

export default async (searchQuery: string): Promise<string[]> => { // eslint-disable-line
  try {
    const searchUrl = `https://yandex.ru/search/?text=${encodeURIComponent(searchQuery)}`
    const res = await superagent
      .get(searchUrl)
      .set({
        'User-Agent': providersConfig.userAgent,
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3'
      })

    const $page = cheerio.load(res.text)
    const s2 = $page('.misspell__message a').first().text()

    return [s2].filter((it) => it)
  } catch (e) {
    console.error(`Fail to fetch suggestion from yandex for: ${searchQuery}`, e)
  }

  return []
}