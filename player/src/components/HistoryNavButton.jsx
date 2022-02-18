import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { Fab } from '@material-ui/core'
import { History as HistoryIcon } from '@material-ui/icons'
import localization from '../localization'

class HistoryNavButton extends React.Component {
    render() {
        const { showLabel } = this.props

        return (
            <div className="history-nav">
                <Link to="/">
                    <Fab variant={ showLabel ? 'extended' : 'round' } size="medium">
                        <HistoryIcon />
                        &nbsp;{ showLabel && localization.watchHistory}
                    </Fab>
                </Link>
            </div>
        )
    }
}

HistoryNavButton.propTypes = {
    showLabel: PropTypes.bool,
    children: PropTypes.element
}

export default HistoryNavButton