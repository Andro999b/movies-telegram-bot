import React, { Fragment, useState } from 'react'
import {
  VolumeUpRounded as VolumeUpIcon,
  VolumeDownRounded as VolumeDownIcon,
  VolumeOffRounded as VolumeOffIcon
} from '@material-ui/icons'
import {
  IconButton,
  Paper,
  Popover,
  Typography
} from '@material-ui/core'
import { observer } from 'mobx-react-lite'

const VOLUME_LEVELS = 15

export default observer(({ device }) => {
  const { volume } = device
  const [anchorEl, setAnchorEl] = useState(null)

  const changeVolume = (inc) => {
    const newVolume = (Math.ceil(device.volume * VOLUME_LEVELS) + inc) / VOLUME_LEVELS
    device.setVolume(Math.max(Math.min(newVolume, 1), 0))
  }

  const handleVolumeUp = () => changeVolume(1)

  const handleVolumeDown = () => changeVolume(-1)

  const handleCloseRequest = () => setAnchorEl(null)

  const toggleVolumePopup = (event) => setAnchorEl(anchorEl ? null : event.currentTarget)

  return (
    <Fragment>
      <IconButton onClick={toggleVolumePopup}>
        {volume == 0 && <VolumeOffIcon />}
        {volume > 0 && <VolumeUpIcon />}
      </IconButton>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={anchorEl != null}
        onClose={handleCloseRequest}
        disablePortal style={{ zIndex: 9999 }}
      >
        <Paper>
          <div className="sound-control__mobile">
            <IconButton onClick={handleVolumeDown}>
              <VolumeDownIcon />
            </IconButton>
            <Typography variant="body2" align="center">
              {Math.ceil(volume * VOLUME_LEVELS)}
            </Typography>
            <IconButton onClick={handleVolumeUp}>
              <VolumeUpIcon />
            </IconButton>
          </div>
        </Paper>
      </Popover>
    </Fragment>
  )
})
