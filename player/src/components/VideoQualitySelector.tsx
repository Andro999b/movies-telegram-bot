import React from 'react'
import { observer } from 'mobx-react-lite'
import Selector from './Selector'
import {
  Button,
  MenuItem,
  MenuList
} from '@mui/material'
import analytics from '../utils/analytics'
import { Device } from '../store/player-store'

interface Props {
  device: Device
}

const VideoQualitySelector: React.FC<Props> = ({ device }) => {
  const { quality, qualities } = device

  return (
    <Selector
      renderButton={({ handleOpen }): React.ReactElement => (
        <Button onClick={handleOpen}>
          {quality ? quality : 'Auto'}
        </Button>
      )}
      renderList={({ handleClose }): React.ReactElement => {
        const selectQuality = (quality: number | null): void => {
          device.setQuality(quality)
          handleClose()

          analytics('select_quality')
        }

        return (
          <MenuList>{qualities
            .map((id) => (
              <MenuItem key={id} selected={id == quality} onClick={(): void => selectQuality(id)}>
                {id}
              </MenuItem>
            ))
            .concat([
              <MenuItem key="auto" selected={quality == null} onClick={(): void => selectQuality(null)}>
                Auto
              </MenuItem>
            ])}</MenuList>
        )
      }}
    />
  )
}

export default observer(VideoQualitySelector)
