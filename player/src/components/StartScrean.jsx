import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Fab, Typography } from '@material-ui/core'
import {
    PlayCircleFilled as PlayIcon,
    Cast as CastIcon,
} from '@material-ui/icons'

import Share from '../components/Share'

class StartScrean extends Component {
    render() {
        const {
            device,
            castAvalaible,
            onStart,
            onCast
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
                {castAvalaible && <div className="player__start-cast-button">
                    <Fab onClick={onCast} size="large">
                        <CastIcon />
                    </Fab>
                </div>}
                <div className="player__telegram-links shadow-border">
                    <Typography>
                        <a href="https://telegram.me/films_search_bot">
                            <span className="icon-telegram vmiddle"/>@films_search_bot
                        </a>
                        <br/>
                        <a href="https://telegram.me/anime_tube_bot">
                            <span className="icon-telegram vmiddle"/>@anime_tube_bot
                        </a>
                    </Typography>
                </div>
            </div>
        )
    }
}

StartScrean.propTypes = {
    device: PropTypes.object,
    onStart: PropTypes.func,
    onCast: PropTypes.func,
    castAvalaible: PropTypes.bool
}

export default StartScrean