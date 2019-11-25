import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import LocalPlayer from '../components/LocalPlayer'
import { inject, observer } from 'mobx-react'
import { PlayCircleFilled as PlayIcon } from '@material-ui/icons'
import { isTouchDevice } from '../utils'

@inject(({ playerStore: { device: { playlist, play }}}) => ({ playlist, play }))
@observer
class PlayerView extends Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            started: false,
            initialFullScreen: false
        }
    }

    handleStartClick = () => {
        this.setState({ started: true })
        if(isTouchDevice()) {
            this.setState({ initialFullScreen: true })
        }
        this.props.play()
    }

    renderStartScrean = () => {
        const { playlist: { image } } = this.props

        return (
            <div 
                className="player__pause-cover player__background-cover" 
                style={{ backgroundImage: `url(${image})`, cursor: 'pointer' }}
                onClick={this.handleStartClick}
            >
                <PlayIcon className="center" fontSize="inherit"/>
            </div>
        )
    }

    render() {
        const { started, initialFullScreen } = this.state

        return (
            <Fragment>
                {!started && this.renderStartScrean()}
                {started && <div className="screan-content">
                    <LocalPlayer initialFullScreen={initialFullScreen} />
                </div>}
            </Fragment>
        )
    }
}

PlayerView.propTypes = {
    playlist: PropTypes.object,
    play: PropTypes.func
}

export default PlayerView