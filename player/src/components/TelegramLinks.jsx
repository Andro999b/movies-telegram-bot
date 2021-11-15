import { Fab } from '@material-ui/core'
import React, { Component } from 'react'

import { Telegram as TelegramIcon } from '@material-ui/icons'
import { animeBot, moviesBot } from '../utils'

class TelegramLinks extends Component {

    openBot(bot) {
        location.href = `https://telegram.me/${bot}`
    }

    render() {
        return (
            <div className="telegram-links">
                <Fab variant="extended" size="small" onClick={() => this.openBot(animeBot)}>
                    <TelegramIcon />
                    @{animeBot}
                </Fab>
                <Fab variant="extended" size="small" onClick={() => this.openBot(moviesBot)}>
                    <TelegramIcon />
                    @{moviesBot}
                </Fab>
            </div>
        )
    }
}


export default TelegramLinks