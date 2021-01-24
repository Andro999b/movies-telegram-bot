import React, { Component } from 'react'
import PropTypes from 'prop-types'

import localization from '../localization'
import { getAlternativeUrl } from '../utils'
import { Typography } from '@material-ui/core'


class AlternativeLinksError extends Component {
    render() {
        const { provider, message, query} = this.props

        return (
            <Typography className="center shadow-border" variant="h4">
                <span>{message}</span>
                <br/>
                <a href={getAlternativeUrl(provider, query)}>
                    {localization.searchAlternatives}
                </a>
            </Typography>
        )
    }
}

AlternativeLinksError.propTypes = {
    query: PropTypes.string.isRequired,
    provider: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired
}

export default AlternativeLinksError