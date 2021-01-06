import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { Fab } from '@material-ui/core'
import { History as HistoryIcon } from '@material-ui/icons'

class BackNavButton extends React.Component {
    render() {
        return (
            <div className="back-nav">
                <Link to="/">
                    <Fab size="medium">
                        <HistoryIcon />
                    </Fab>
                </Link>
            </div>
        )
    }
}

BackNavButton.propTypes = {
    children: PropTypes.element
}

export default BackNavButton