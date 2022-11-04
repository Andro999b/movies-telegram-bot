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
import { File, FileUrl } from '../types'

const canDownload = ({ url, hls }: FileUrl): boolean => !url.endsWith('m3u8') && !hls

const getDownloadUrl = async ({ url, extractor }: FileUrl, fileName: string): Promise<string> => {
  const proxyUrl = 'https://dl.movies-player.workers.dev'

  let downloadUrl = extractor ? await createExtractorUrlBuilder(extractor)(url) : url
  downloadUrl = `${proxyUrl}?url=${encodeURIComponent(downloadUrl)}&title=${encodeURIComponent(fileName)}`

  return downloadUrl
}

const getTitle = ({ quality, audio }: FileUrl): string => [audio, quality].filter((it) => it).join(' - ')

interface Props {
  title: string
  file: File
}

const DownloadSelector: React.FC<Props> = ({ file, title }) => {
  const urls = file.urls?.filter(canDownload) ?? []

  const handleDownload = async (url: FileUrl): Promise<void> => {
    const fileName = `${title} - ${file.name}`

    const downloadUrl = await getDownloadUrl(url, fileName)

    download(downloadUrl, fileName)

    analytics('download_file')
  }

  return (
    <Selector
      renderButton={({ handleOpen }): React.ReactElement | null => {
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
            <IconButton onClick={(): void => {
              handleDownload(urls[0])
            }}>
              <DownloadIcon />
            </IconButton>
          )
        }
      }}
      renderList={(): React.ReactElement | null => {
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
                onClick={(): void => {
                  handleDownload(it)
                }}
              >
                {title}
              </MenuItem>
            )
          })

        return (<MenuList>{items}</MenuList>)
      }} />
  )
}

export default DownloadSelector
