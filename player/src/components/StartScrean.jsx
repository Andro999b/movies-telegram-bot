import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Typography } from '@material-ui/core'
import { PlayCircleFilled as PlayIcon } from '@material-ui/icons'

import Share from '../components/Share'
import localization from '../localization'

class StartScrean extends Component {
    render() {
        const {
            device,
            onStart
        } = this.props

        const { playlist: { image } } = device

        return (
            <div>
                <div
                    className="player__pause-cover player__background-cover"
                    style={{ backgroundImage: image ? `url(${image})` : null, cursor: 'pointer' }}
                    onClick={onStart}
                >
                    <PlayIcon className="center shadow-icon" fontSize="inherit" />
                </div>
                <Share device={device} />
                <div className="player__telegram-links shadow-border">
                    <Typography>
                        <a href="https://telegram.me/anime_tube_bot">
                            <span className="icon-telegram vmiddle"/>@anime_tube_bot
                        </a> - {localization.animeBotTip}
                        <br/>
                        <a href="https://telegram.me/films_search_bot">
                            <span className="icon-telegram vmiddle"/>@films_search_bot 
                        </a> - {localization.moviesBotTip}                        
                    </Typography>
                </div>
            </div>
        )
    }
}

StartScrean.propTypes = {
    device: PropTypes.object,
    onStart: PropTypes.func
}

export default StartScrean