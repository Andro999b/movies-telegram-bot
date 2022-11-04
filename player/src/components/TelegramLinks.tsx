import { Fab } from '@mui/material'
import React from 'react'

import { Telegram as TelegramIcon } from '@mui/icons-material'
import { tgBots } from '../utils'

const openBot = (bot: string): void => {
  window.open(`https://telegram.me/${bot}`, '_blank')
}

const TelegramLinks: React.FC = () => (
  <div className="telegram-links">
    {tgBots.map((bot) => (
      <Fab variant="extended" size="small" onClick={(): void => openBot(bot)} key={bot}>
        <TelegramIcon />
        @{bot}
      </Fab>
    ))}
  </div>
)

export default TelegramLinks