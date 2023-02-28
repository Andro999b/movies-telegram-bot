import IconButton from '@mui/material/IconButton'
import PictureInPictureIcon from '@mui/icons-material/PictureInPicture'
import { observer } from 'mobx-react-lite'
import React, { FC } from 'react'
import { Device } from '../store/player-store'

interface Props {
  device: Device
}

const PictureInPicture: FC<Props> = ({ device }) => {
  if (!('pictureInPictureEnabled' in document) && document.pictureInPictureEnabled) {
    return null
  }

  const togglePictureInPicture = (): void => {
    device.setPip(!device.pip)
  }

  return (
    <div className='player__picture-in-picture'>
      <IconButton onClick={togglePictureInPicture}>
        <PictureInPictureIcon />
      </IconButton>
    </div>
  )
}

export default observer(PictureInPicture)
