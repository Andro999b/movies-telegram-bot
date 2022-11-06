import superagent from 'superagent'
import { File } from '../types/index.js'
import convertPlayerJSPlaylist from './convertPlayerJSPlaylist.js'
import stripPlayerJSConfig from './stripPlayerJSConfig.js'

export default async (url: string): Promise<File[]> => {
  let res
  try {
    res = await superagent.get(url.startsWith('//') ? 'https:' + url : url).disableTLSCerts()
  } catch (e) {
    console.error('Fail get iframe', url, e)
    return []
  }

  const config = stripPlayerJSConfig(res.text)

  if (config) {
    const { file } = config
    return convertPlayerJSPlaylist(file)
  }

  return []
}