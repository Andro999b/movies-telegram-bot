import React, { Component } from 'react'
import PropTypes from 'prop-types'

import localization from '../localization'
import { base64UrlEncode } from '../utils/base64'
import { Typography } from '@material-ui/core'

function getAlternativeUrl(provider, query) {
    let bot
    switch(provider) {
        case 'animevost': 
        case 'nekomori': 
            bot = 'anime_tube_bot'
            break 
        default:
            bot = 'films_search_bot'
    }

    return `https://t.me/${bot}?start=${encodeURIComponent(base64UrlEncode(query))}`
}

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