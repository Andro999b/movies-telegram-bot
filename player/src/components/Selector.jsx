import React, { useState } from 'react'
import { Popover, Paper } from '@material-ui/core'

export default ({ renderButton, renderList }) => {
  const [anchorEl, setAnchorEl] = useState(null)

  const handleOpen = (e) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const button = renderButton({ handleOpen, handleClose })
  const list = renderList({ handleOpen, handleClose })

  if (button == null || list == null)
    return null

  return (
    <>
      {button}
      <Popover
        container={document.getElementById('player_root')}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        style={{ zIndex: 9999 }}
      >
        <Paper>
          {list}
        </Paper>
      </Popover>
    </>
  )
}
