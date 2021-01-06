import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { PlayCircleFilled as PlayIcon } from '@material-ui/icons'

import Share from './Share'
import BackNavButton from './BackNavButton'
import TelegramLinks from './TelegramLinks'

class StartScrean extends Component {
    render() {
        const { onStart, playlist } = this.props
        const { image  } = playlist


        return (
            <div>
                <div
                    className="player__pause-cover player__background-cover"
                    style={{ backgroundImage: image ? `url(${image})` : null, cursor: 'pointer' }}
                    onClick={onStart}
                >
                    <PlayIcon className="center shadow-icon" fontSize="inherit" />
                </div>
                <BackNavButton/>
                <Share playlist={playlist} />
                <TelegramLinks/>
            </div>
        )
    }
}

StartScrean.propTypes = {
    playlist: PropTypes.object,
    onStart: PropTypes.func
}

export default StartScrean