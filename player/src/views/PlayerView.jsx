import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import Player from '../components/Player'
import { inject, observer } from 'mobx-react'
import { isTouchDevice } from '../utils'
import analytics from '../utils/analytics'

import CastDialog from '../components/CastDialog'
import StartScrean from '../components/StartScrean'

@inject(
    ({ 
        castStore: { showCastDialog, castAvalaible },
        playerStore: { device }
    }) => ({ 
        showCastDialog,
        castAvalaible,
        device
    })
)
@observer
class PlayerView extends Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            started: props.started,
            initialFullScreen: false
        }
    }

    handleCastClick = () => {
        this.props.showCastDialog(() => {
            this.setState({ started: true })
        })
    }

    handleStartClick = () => {
        this.setState({ started: true })
        if(isTouchDevice()) {
            this.setState({ initialFullScreen: true })
        }
        this.props.device.play()
        analytics('start', 'video', document.title)
    }

    render() {
        const { started, initialFullScreen  } = this.state
        const { device, castAvalaible } = this.props

        return (
            <Fragment>
                {!started && <StartScrean
                    device={device}
                    castAvalaible={castAvalaible}
                    onStart={this.handleStartClick}
                    onCast={this.handleCastClick}
                />}
                {started && <div className="screan-content">
                    <Player initialFullScreen={initialFullScreen} />
                </div>}
                <CastDialog/>
            </Fragment>
        )
    }
}

PlayerView.propTypes = {
    showCastDialog: PropTypes.func,
    device: PropTypes.object,
    started: PropTypes.bool,
    castAvalaible: PropTypes.bool
}

export default PlayerView