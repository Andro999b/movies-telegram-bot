import React from 'react'
import PropTypes from 'prop-types'
import BaseSelector from './BaseSelector'
import {
    IconButton,
    MenuItem,
    MenuList
} from '@material-ui/core'
import { GetAppRounded as DownloadIcon } from '@material-ui/icons'
import { createExtractorUrlBuilder } from '../utils/extract'
import { download } from '../utils'
import analytics from '../utils/analytics'

class DownloadSelector extends BaseSelector {

    constructor(props) {
        super(props)

        this.urls = props.file.urls.filter(this.canDownload)
    }

    getDownloadUrl = async ({ url, extractor }, fileName) => {
        const proxyUrl = 'https://dl.movies-player.workers.dev'

        let downloadUrl = extractor ? await createExtractorUrlBuilder(extractor)(url) : url
        downloadUrl = `${proxyUrl}?url=${encodeURIComponent(downloadUrl)}&title=${encodeURIComponent(fileName)}`

        return downloadUrl
    }

    getTitle = ({ quality, audio }) => [audio, quality].filter((it) => it).join(' - ')

    handleDownload = async (url) => {
        const { file, title } = this.props
        const fileName = `${title} - ${file.name}`

        const downloadUrl = await this.getDownloadUrl(url, fileName)

        download(downloadUrl, fileName)

        analytics('download_file')
    }

    canDownload = ({ url, hls }) => !url.endsWith('m3u8') && !hls

    renderButton() {
        if(this.urls.length == 0) {
            return null
        }

        if (this.urls.length > 1) {
            return (
                <IconButton onClick={this.handleClick}>
                    <DownloadIcon />
                </IconButton>
            )
        } else {
            return (
                <IconButton
                    onClick={async () => this.handleDownload(this.urls[0])}
                >
                    <DownloadIcon />
                </IconButton>
            )
        }
    }

    renderList() {
        if(this.urls.length == 0) {
            return null
        }

        const items = this.urls
            .map((it, index) => {
                const title = this.getTitle(it)

                return (
                    <MenuItem
                        component='a'
                        key={index}
                        onClick={async () => this.handleDownload(it)}
                    >
                        {title}
                    </MenuItem>
                )
            })

        return (<MenuList>{items}</MenuList>)
    }
}

DownloadSelector.propTypes = {
    file: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired
}

export default DownloadSelector