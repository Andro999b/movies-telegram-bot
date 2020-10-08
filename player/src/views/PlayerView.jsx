import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import Player from '../components/Player'
import { inject, observer } from 'mobx-react'
import { isTouchDevice } from '../utils'
import analytics from '../utils/analytics'

import StartScrean from '../components/StartScrean'

@inject(
    ({ playerStore: { device } }) => ({ device })
)
@observer
class PlayerView extends Component {
    constructor(props) {
        super(props)

        this.state = {
            started: props.started,
            initialFullScreen: false
        }
    }

    handleStartClick = () => {
        this.setState({ started: true })
        if(isTouchDevice()) {
            this.setState({ initialFullScreen: true })
        }
        this.props.device.play()
        analytics('start', document.title)
    }

    render() {
        const { started, initialFullScreen  } = this.state
        const { device } = this.props

        return (
            <Fragment>
                {!started && <StartScrean
                    device={device}
                    onStart={this.handleStartClick}
                    onCast={this.handleCastClick}
                />}
                {started && <div className="screan-content">
                    <Player initialFullScreen={initialFullScreen} />
                </div>}
            </Fragment>
        )
    }
}

PlayerView.propTypes = {
    device: PropTypes.object,
    started: PropTypes.bool,
}

export default PlayerView