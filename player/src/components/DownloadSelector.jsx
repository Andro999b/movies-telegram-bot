import React from 'react'
import PropTypes from 'prop-types'
import BaseSelector from './BaseSelector'
import {
    IconButton,
    MenuItem,
    MenuList
} from '@material-ui/core'
import { GetAppRounded as DownloadIcon } from '@material-ui/icons'
import { createExtractorUrlBuilder } from '../utils'
import analytics from '../utils/analytics'

class DownloadSelector extends BaseSelector {

    getTitleAndDownloadUrl = ({ url, quality, audio, extractor }, fileName) => {
        const proxyUrl = "https://dl.movies-player.workers.dev"
     
        let downloadUrl = extractor ? createExtractorUrlBuilder(extractor)(url) : url
        downloadUrl = `${proxyUrl}?url=${encodeURIComponent(downloadUrl)}&title=${encodeURIComponent(fileName)}`

        return {
            downloadUrl,
            title: [audio, quality].filter((it) => it).join(' - ')
        }
    }

    handleTrackDownload = () => {
        const { file, title } = this.props

        analytics('downloadFile', `${title} - ${file.name}`)
    }

    renderButton() {
        const { file, title } = this.props
        const { urls } = file
        const fileName = `${title} - ${file.name}`

        if (urls.length > 1) {
            return (
                <IconButton onClick={this.handleClick}>
                    <DownloadIcon />
                </IconButton>
            )
        } else {
            const { downloadUrl } = this.getTitleAndDownloadUrl(urls[0], fileName)

            return (
                <IconButton
                    component='a'
                    href={downloadUrl}
                    download={fileName}
                    target="_blank"
                    onClick={this.handleTrackDownload}
                >
                    <DownloadIcon />
                </IconButton>
            )
        }
    }

    renderList() {
        const { file, title } = this.props
        const { urls } = file
        const fileName = `${title} - ${file.name}`

        if (urls) {
            const items = urls.map((it, index) => {
                const { title, downloadUrl } = this.getTitleAndDownloadUrl(it, fileName)

                return (
                    <MenuItem
                        component='a'
                        href={downloadUrl}
                        download={fileName}
                        target="_blank"
                        key={index}
                        onClick={this.handleTrackDownload}
                    >
                        {title}
                    </MenuItem>
                )
            })

            return (<MenuList>{items}</MenuList>)
        }
    }
}

DownloadSelector.propTypes = {
    file: PropTypes.object,
    title: PropTypes.string
}

export default DownloadSelector