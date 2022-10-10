import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { Fab, Tooltip } from '@material-ui/core'
import { History as HistoryIcon } from '@material-ui/icons'
import localization from '../localization'

class HistoryNavButton extends React.Component {
    render() {
        return (
            <div className="history-nav">
                <Link to="/">
                    <Tooltip title={localization.watchHistory} placement="right">
                        <Fab variant={ 'circular' } size="medium">
                            <HistoryIcon />
                        </Fab>
                    </Tooltip>
                </Link>
            </div>
        )
    }
}

HistoryNavButton.propTypes = {
    children: PropTypes.element
}

export default HistoryNavButton