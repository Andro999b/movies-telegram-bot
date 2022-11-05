import superagent from 'superagent'
import { extractStringProperty } from './extractScriptVariable'
const HTTPS_PATTERN = /http?s:\/\/[^\s]+/

const extractFromKinopoisk = async (link: string): Promise<string | null> => {
  if (link.startsWith('https://www.kinopoisk.ru')) {
    const res = await superagent
      .get(`https://corsproxy.movies-player.workers.dev/?${link}`)
      .timeout(5000)

    return extractStringProperty(res.text, 'name')
  }

  return null
}

const extractFromUrlParams = (link: string): string | null => {
  const parts = link.match(/&(q|text)=([^&]+)/)

  if (parts && parts.length > 2) {
    const query = parts[2]

    return decodeURIComponent(query).replace(HTTPS_PATTERN, '')
  }

  return null
}

const extractFromGoogleShorts = async (link: string): Promise<string | null> => {
  if (link.startsWith('https://g.co')) {
    const res = await superagent
      .get(link)
      .timeout(5000)
      .redirects(0)
      .ok((r) => r.status < 400)

    link = res.header['location']

    if (link == null) return null
    return extractFromUrlParams(link)
  }

  return null
}

const removeLink = (link: string): string => link.replace(HTTPS_PATTERN, '')

module.exports = async (searchQuery: string): Promise<string> => {
  const [link] = searchQuery.match(HTTPS_PATTERN) ?? []
  if (!link) return searchQuery

  let query = await extractFromGoogleShorts(link)
  if (query) return query

  query = await extractFromKinopoisk(link)
  if (query) return query

  query = extractFromUrlParams(link)
  if (query) return query

  return removeLink(searchQuery)
}
module.exports.HTTPS_PATTERN = HTTPS_PATTERN