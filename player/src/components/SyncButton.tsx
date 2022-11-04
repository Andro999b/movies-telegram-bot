import { IconButton, Typography } from '@mui/material'
import { Cloud, CloudOff } from '@mui/icons-material'
import React from 'react'

interface Props {
  insync: boolean
  onConnect: () => void
  onDisconnect: () => void
}

const SyncButton: React.FC<Props> = ({ insync, onConnect, onDisconnect }) => {
  if (insync) {
    return (
      <Typography>
        InSync
        <IconButton onClick={onDisconnect} size="large">
          <Cloud />
        </IconButton>
      </Typography>
    )
  } else {
    return (
      <Typography>
        Not InSync
        <IconButton onClick={onConnect} size="large">
          <CloudOff />
        </IconButton>
      </Typography>
    )
  }
}

export default SyncButton
