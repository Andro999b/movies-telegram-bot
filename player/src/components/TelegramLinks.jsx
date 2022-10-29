import { Fab } from '@material-ui/core'
import React from 'react'

import { Telegram as TelegramIcon } from '@material-ui/icons'
import { tgBots } from '../utils'

const openBot = (bot) => {
  window.open(`https://telegram.me/${bot}`, '_blank')
}

export default () => (
  <div className="telegram-links">
    {tgBots.map((bot) => (
      <Fab variant="extended" size="small" onClick={() => openBot(bot)} key={bot}>
        <TelegramIcon />
        @{bot}
      </Fab>
    ))}
  </div>
)
