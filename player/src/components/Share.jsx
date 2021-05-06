import React from 'react'
import PropTypes from 'prop-types'
import BaseSelector from './BaseSelector'
import copy from 'clipboard-copy'
import {
    IconButton,
    Typography,
    FormGroup,
    FormControlLabel,
    Switch
} from '@material-ui/core'
import {
    ShareRounded as ShareIcon,
    FileCopyRounded as CopyIcon
} from '@material-ui/icons'
import { inject } from 'mobx-react'

import analytics from '../utils/analytics'
import localization from '../localization'

@inject(({ notificationStore: { showMessage }}) => ({ showMessage }))
class Share extends BaseSelector {

    constructor(props) {
        super(props)

        this.state.sharePosition = props.device !== undefined
        this.state.shareTime = false
    }

    toggleSharePosition = () => this.setState(({ sharePosition }) => ({ sharePosition: !sharePosition }))
    toggleShareTime = () => this.setState(({ shareTime }) => ({ shareTime: !shareTime }))

    renderButton() {
        return (
            <IconButton onClick={this.handleClick}>
                <ShareIcon />
            </IconButton>
        )
    }

    getShareUrl = (sharePosition, shareTime) => {
        const { playlist: { provider, id, query } } = this.props
        const newParams = new URLSearchParams()

        newParams.set('provider', provider)
        newParams.set('id', decodeURIComponent(id))

        if(query) newParams.set('query', query)

        const { device } = this.props
        if (device !== undefined && sharePosition) {
            const { currentTime, currentFileIndex } =device

            newParams.set('file', currentFileIndex)

            if (shareTime) {
                newParams.set('time', Math.floor(currentTime))
            }
        }

        return encodeURIComponent(location.protocol + '//' + location.host + location.pathname + '#/watch?' + newParams.toString()) 
    }

    getTitle = (sharePosition) => {
        if (sharePosition) {
            return encodeURIComponent(document.title)
        } else {
            const { playlist: { title } } = this.props
            return encodeURIComponent(title)
        }
    }

    handleShare = () => {
        analytics('share', document.title)
    }

    handleCopy = (url) => {
        copy(decodeURIComponent(url))
        this.props.showMessage(localization.urlCopied)
    }

    renderList() {
        const { device } = this.props
        const { sharePosition, shareTime } = this.state
        const url = this.getShareUrl(sharePosition, shareTime)
        const title = this.getTitle(sharePosition)

        console.log(url)

        return (
            <div className="player__share-content">
                <Typography>
                    {localization.shareWith}
                </Typography>
                <div>
                    <a className="icon-vkontakte"
                        href={`http://vk.com/share.php?url=${url}&title=${title}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => this.handleShare('vk')}
                    />
                    <a className="icon-telegram"
                        href={`https://telegram.me/share/url?url=${url}&text=${title}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => this.handleShare('telegram')}
                    />
                    <a className="icon-facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${url}&t=${title}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => this.handleShare('facebook')}
                    />
                    <a className="icon-viber"
                        href={`viber://forward?text=${title}%20$${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => this.handleShare('viber')}
                    />
                    <a className="icon-whatsapp"
                        href={`whatsapp://send?text=${title}%20$${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => this.handleShare('whatsapp')}
                    />
                    <a className="icon-twitter"
                        href={`https://twitter.com/intent/tweet?text=${title}%20${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => this.handleShare('twitter')}
                    />
                    <a className="icon-copy" onClick={() => this.handleCopy(url)}>
                        <CopyIcon />
                    </a>
                </div>
                {(device !== undefined) && <div>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={sharePosition}
                                    onChange={this.toggleSharePosition}
                                    color="primary"
                                />
                            }
                            label={localization.curPlaylistPos}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={shareTime}
                                    onChange={this.toggleShareTime}
                                    color="primary"
                                />
                            }
                            label={localization.curTimePos}
                        />
                    </FormGroup>
                </div>}
            </div>
        )
    }

    render() {
        return (
            <div className="player__share">
                {super.render()}
            </div>
        )
    }
}

Share.propTypes = {
    showMessage: PropTypes.func,
    device: PropTypes.any,
    playlist: PropTypes.any
}

export default Share 