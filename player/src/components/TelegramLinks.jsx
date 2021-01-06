import { Fab } from '@material-ui/core'
import React, { Component } from 'react'

import { Telegram as TelegramIcon } from '@material-ui/icons'

class TelegramLinks extends Component {

    openBot(bot) {
        location.href = `https://telegram.me/${bot}`
    }

    render() {
        return (
            <div className="telegram-links">
                <Fab variant="extended" size="small" onClick={() => this.openBot('anime_tube_bot')}>
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