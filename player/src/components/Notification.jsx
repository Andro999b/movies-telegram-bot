import React from 'react'

import { Snackbar } from '@material-ui/core'

import { observer } from 'mobx-react-lite'
import { notificationStore } from '../store'

export default observer(() => {
  const { message, open } = notificationStore

  const handleClose = () => notificationStore.hideMessage()

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      autoHideDuration={2000}
      open={open}
      onClose={handleClose}
      onClick={handleClose}
      message={message}
    />
  )
})
