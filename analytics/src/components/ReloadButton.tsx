import React from 'react'
import { Refresh as RefreshIcon } from '@mui/icons-material'
import { Fab } from '@mui/material'


import makeStyles from '@mui/styles/makeStyles'


const useStyles = makeStyles({
  fab: {
    position: 'fixed',
    bottom: 10,
    right: 10,
  }
})

interface Props {
  onClick: () => void
}

const ReloadButton: React.FC<Props> = ({ onClick }) => {
  const classes = useStyles()
  return (
    <Fab color="primary" className={classes.fab} onClick={onClick}>
      <RefreshIcon />
    </Fab>
  )
}

export default ReloadButton
