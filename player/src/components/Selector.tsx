import React, { useState, MouseEvent } from 'react'
import { Popover, Paper } from '@mui/material'

interface RenderFunProps {
  handleOpen: (e: MouseEvent) => void
  handleClose: () => void
}

interface Props {
  renderButton: React.FC<RenderFunProps>
  renderList: React.FC<RenderFunProps>
}

const Selector: React.FC<Props> = ({ renderButton, renderList }) => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)

  const handleOpen = (e: MouseEvent): void => setAnchorEl(e.currentTarget)
  const handleClose = (): void => setAnchorEl(null)

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


export default Selector
