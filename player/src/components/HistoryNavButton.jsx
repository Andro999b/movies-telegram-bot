import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { Fab } from '@material-ui/core'
import { History as HistoryIcon } from '@material-ui/icons'

class HistoryNavButton extends React.Component {
    render() {
        return (
            <div className="history-nav">
                <Link to="/">
                    <Fab size="medium">
                        <HistoryIcon />
                    </Fab>
                </Link>
            </div>
        )
    }
}

HistoryNavButton.propTypes = {
    children: PropTypes.element
}

export default HistoryNavButton