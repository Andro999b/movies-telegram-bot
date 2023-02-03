import { File } from '../../types'
import { SourceLoader } from '.'
import getBestPlayerJSQuality from '../parsePlayerJSFile'
import decodePlayerJSPlaylist from '../decodePlayerJSPlaylist'

const FILE_REG_EXP = /'file':\s*'([^']+)'/
const decodeKeys = [
  '@#!@@@##$$@@',
  '$$$####!!!!!!!',
  '@!^^!@#@@$$$$$',
  '^^#@@!!@#!$',
  '^^^^^^##@'
]

const getIframeUrl = (token: string, type: string): string => {
  let basePath

  if (type == 'embed') {
    basePath = `https://voidboost.net/embed/${token}`
  } else {
    basePath = `https://voidboost.net/${type}/${token}/iframe`
  }

  return `${basePath}?&h=gidonline.io&&df=1&vstop=7&vsleft=44&partner=gidonline`
}

const gidonlineSource: SourceLoader = async (sourceId: string, params: Record<string, string>): Promise<Partial<File>> => {
  const { type, s, e } = params
  const url = getIframeUrl(sourceId, type) + `&s=${s}&e=${e}`

  const res = await fetch(url)
  const text = await res.text()

  const parts = text.match(FILE_REG_EXP)
  const file = parts[1]

  return {
    urls: getBestPlayerJSQuality(decodePlayerJSPlaylist(file, decodeKeys))
  }
}

export default gidonlineSource

