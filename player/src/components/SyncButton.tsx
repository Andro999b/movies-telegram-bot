import { IconButton, Typography } from '@material-ui/core'
import { Cloud, CloudOff } from '@material-ui/icons'
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
        <IconButton onClick={onDisconnect}>
          <Cloud />
        </IconButton>
      </Typography>
    )
  } else {
    return (
      <Typography>
        Not InSync
        <IconButton onClick={onConnect}>
          <CloudOff />
        </IconButton>
      </Typography>
    )
  }
}

export default SyncButton
