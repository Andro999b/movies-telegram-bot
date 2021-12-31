import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Typography } from '@material-ui/core'
import HistoryNavButton from './HistoryNavButton'

class PlayerTitle extends Component {
    render() {
        const { title } = this.props

        return (
            <>
                <HistoryNavButton />
                <div className="player__title">
                    <Typography variant="h6" style={{ wordBreak: 'break-all' }}>
                        {title}
                    </Typography>
                </div>
            </>
        )
    }
}

PlayerTitle.propTypes = {
    title: PropTypes.string
}

export default PlayerTitle