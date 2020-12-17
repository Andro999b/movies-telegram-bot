import { Fab } from '@material-ui/core'
import { Telegram } from '@material-ui/icons'
import React, { Component } from 'react'

import { Telegram as TelegramIcon } from '@material-ui/icons'

class TelegramLinks extends Component {

    openBot(bot) {
        location.href = `https://telegram.me/${bot}`
    }

    render() {
        return (
            <div className="player__telegram-links">
                <Fab variant="extended" size="small" style={{ marginRight: '10px' }} onClick={() => this.openBot('anime_tube_bot')}>
                    <TelegramIcon />
                    @anime_tube_bot
                </Fab>
                <Fab variant="extended" size="small" onClick={() => this.openBot('films_search_bot')}>
                    <TelegramIcon />
                    @films_search_bot
                </Fab>
            </div>
        )
    }
}


export default TelegramLinks