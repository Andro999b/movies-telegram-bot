import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Typography } from '@material-ui/core'
import BackNavButton from './BackNavButton'

class PlayerTitle extends Component {
    render() {
        const { title } = this.props

        return (
            <>
                <BackNavButton />
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