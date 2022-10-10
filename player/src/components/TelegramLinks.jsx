import { Fab } from '@material-ui/core'
import React, { Component } from 'react'

import { Telegram as TelegramIcon } from '@material-ui/icons'
import { tgBots } from '../utils'

class TelegramLinks extends Component {

    openBot(bot) {
        location.href = `https://telegram.me/${bot}`
    }

    render() {
        return (
            <div className="telegram-links">
                {tgBots.map((bot) => (
                    <Fab variant="extended" size="small" onClick={() => this.openBot(bot)} key={bot}>
                        <TelegramIcon />
                        @{bot}
                    </Fab>
                ))}
            </div>
        )
    }
}


export default TelegramLinks