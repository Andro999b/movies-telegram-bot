import superagent from 'superagent'
import makeResponse from '../utils/makeResponse'
import providersConfig from '../providersConfig'
import KinogoProvider from '../providers/KinogoProvider'
import { Extractor } from '.'

const baseUrl = providersConfig.providers.kinogo.baseUrl

const KinogoExtractor: Extractor = async ({ url, file }) => {
  const timeout = 5000
  const { iframeHost, csrfToken, playlistPath } = await KinogoProvider
    .parseIframeV1(url, baseUrl, timeout)

  const playlistUrl = `https://${iframeHost}${playlistPath}`

  const playlistRes = await superagent.post(playlistUrl)
    .set({
      'Referer': `https://${iframeHost}`,
      'X-CSRF-TOKEN': csrfToken
    })
    .timeout(timeout)

  const rootFiles = playlistRes.body
  const [seasonIndex, fileIndex, urlIndex] = file.split(',')
  const filePath = rootFiles[+seasonIndex].folder[+fileIndex].folder[+urlIndex].file
  const fileUrl = KinogoProvider.getFileUrlV1(iframeHost, filePath)

  const fileRes = await superagent.post(fileUrl)
    .set({
      'Referer': `https://${iframeHost}`,
      'X-CSRF-TOKEN': csrfToken
    })
    .buffer()
    .timeout(timeout)

  return makeResponse(null, 302, {
    Location: fileRes.text
  })
}

export default KinogoExtractor