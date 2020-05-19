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

    handleMobileDownload = (downloadUrl) => {
        const { title, file } = this.props

        const name = [file.path, file.name].filter((it) => it).join(' - ')

        downloadUrl = downloadUrl.startsWith('//') ? 'https:' + downloadUrl : downloadUrl

        mobileApp.downloadFile(downloadUrl, title, name)
    }

    handleTrackDownload = () => {
        const { file, title } = this.props

        analytics('downloadFile', 'downloadFile', `${title} - ${file.name}`)
    }

    renderButton() {
        const { file } = this.props
        const { url, extractor, qualitiesUrls } = file

        const downloadUrl = extractor ? createExtractorUrlBuilder(extractor)(url) : url

        if (qualitiesUrls) {
            return (
                <IconButton onClick={this.handleClick}>
                    <DownloadIcon />
                </IconButton>
            )
        } else {
            if (window.mobileApp) {
                return (
                    <IconButton onClick={() => this.handleMobileDownload(downloadUrl)}>
                        <DownloadIcon />
                    </IconButton>
                )
            } else {
                return (
                    <IconButton
                        component='a'
                        href={downloadUrl}
                        download={downloadUrl}
                        target="_blank"
                        onClick={this.handleTrackDownload}
                    >
                        <DownloadIcon />
                    </IconButton>
                )
            }
        }
    }

    renderList() {
        const { file } = this.props
        const { extractor, qualitiesUrls } = file

        if (qualitiesUrls) {
            const items = qualitiesUrls.map(({ quality, url }) => {
                const downloadUrl = extractor ? createExtractorUrlBuilder(extractor)(url) : url

                if (window.mobileApp) {
                    return (
                        <MenuItem key={quality} onClick={() => this.handleMobileDownload(downloadUrl)}>
                            {quality}
                        </MenuItem>
                    )
                } else {
                    return (
                        <MenuItem
                            component='a'
                            href={downloadUrl}
                            download={downloadUrl}
                            target="_blank"
                            key={quality}
                            onClick={this.handleTrackDownload}
                        >
                            {quality}
                        </MenuItem>
                    )
                }
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