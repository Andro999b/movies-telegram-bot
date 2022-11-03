import React, { Fragment, MouseEvent, useState } from 'react'
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
import { Device } from '../store/player-store'

const VOLUME_LEVELS = 15

interface Props {
  device: Device
}

const MobileSoundControl: React.FC<Props> = ({ device }) => {
  const { volume } = device
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)

  const changeVolume = (inc: number): void => {
    const newVolume = (Math.ceil(device.volume * VOLUME_LEVELS) + inc) / VOLUME_LEVELS
    device.setVolume(Math.max(Math.min(newVolume, 1), 0))
  }

  const handleVolumeUp = (): void => changeVolume(1)

  const handleVolumeDown = (): void => changeVolume(-1)

  const handleCloseRequest = (): void => setAnchorEl(null)

  const toggleVolumePopup = (event: MouseEvent): void =>
    setAnchorEl(anchorEl ? null : event.currentTarget)

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
}

export default observer(MobileSoundControl)
