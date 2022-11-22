import crawler from '../crawler'
import providersConfig from '../../providersConfig'

export default async (searchQuery: string): Promise<string[]> => {
  try {
    const url = `https://kinobaza.com.ua/search?q=${encodeURIComponent(searchQuery)}`

    const results = await crawler.get<{ title: string }>(url)
      .scope('[itemtype="http://schema.org/Movie"]')
      .headers({
        'User-Agent': providersConfig.userAgent
      })
      .set({
        title: '[itemprop="name"]'
      })
      .limit(10)
      .gather()

    return results.map(({ title }) => title)
  } catch (e) {
    console.error(`Fail to fetch suggestion from kinobaza.com.ua for: ${searchQuery}`, e)
  }

  return []
}