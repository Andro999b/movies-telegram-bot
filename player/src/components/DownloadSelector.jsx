import React from 'react'
import Selector from './Selector'
import {
  IconButton,
  MenuItem,
  MenuList
} from '@material-ui/core'
import { GetAppRounded as DownloadIcon } from '@material-ui/icons'
import { createExtractorUrlBuilder } from '../utils/extract'
import { download } from '../utils'
import analytics from '../utils/analytics'

const canDownload = ({ url, hls }) => !url.endsWith('m3u8') && !hls
const getDownloadUrl = async ({ url, extractor }, fileName) => {
  const proxyUrl = 'https://dl.movies-player.workers.dev'

  let downloadUrl = extractor ? await createExtractorUrlBuilder(extractor)(url) : url
  downloadUrl = `${proxyUrl}?url=${encodeURIComponent(downloadUrl)}&title=${encodeURIComponent(fileName)}`

  return downloadUrl
}
const getTitle = ({ quality, audio }) => [audio, quality].filter((it) => it).join(' - ')

export default ({ file, title }) => {
  const urls = file.urls.filter(canDownload)

  const handleDownload = async (url) => {
    const fileName = `${title} - ${file.name}`

    const downloadUrl = await getDownloadUrl(url, fileName)

    download(downloadUrl, fileName)

    analytics('download_file')
  }

  return (
    <Selector
      renderButton={({ handleOpen }) => {
        if (urls.length == 0) {
          return null
        }

        if (urls.length > 1) {
          return (
            <IconButton onClick={handleOpen}>
              <DownloadIcon />
            </IconButton>
          )
        } else {
          return (
            <IconButton onClick={() => handleDownload(this.urls[0])}>
              <DownloadIcon />
            </IconButton>
          )
        }
      }}
      renderList={() => {
        if (urls.length == 0) {
          return null
        }

        const items = urls
          .map((it, index) => {
            const title = getTitle(it)

            return (
              <MenuItem
                component='a'
                key={index}
                onClick={() => handleDownload(it)}
              >
                {title}
              </MenuItem>
            )
          })

        return (<MenuList>{items}</MenuList>)
      }}
    />
  )
}
