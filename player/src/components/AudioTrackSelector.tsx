import React from 'react'
import Selector from './Selector'
import { observer } from 'mobx-react-lite'
import {
  IconButton,
  Button,
  MenuItem,
  MenuList
} from '@material-ui/core'
import { AudiotrackRounded as AudioTrackIcon } from '@material-ui/icons'
import { isTouchDevice } from '../utils'
import localization from '../localization'
import analytics from '../utils/analytics'
import { Device } from '../store/player-store'

interface Props {
  device: Device
}

const AudioTrackSelector: React.FC<Props> = ({ device }) => {
  const { audioTrack, audioTracks } = device

  const selectTrack = (id: string): void => {
    device.setAudioTrack(id)
    analytics('select_audio')
  }

  return (<Selector
    renderButton={({ handleOpen }): React.ReactElement => {
      if (isTouchDevice()) {
        return (
          <IconButton onClick={handleOpen}>
            <AudioTrackIcon />
          </IconButton>
        )
      } else {
        const selectedTrack = audioTracks.find((it) => it.id == audioTrack)

        if (selectedTrack) {
          return (
            <Button onClick={handleOpen}>
              {selectedTrack.name}
            </Button>
          )
        } else {
          return (
            <Button onClick={handleOpen}>
              {localization.translation}
            </Button>
          )
        }
      }
    }}
    renderList={({ handleClose }): React.ReactElement => {
      const { audioTrack, audioTracks } = device

      const items = audioTracks.map(({ id, name }) => (
        <MenuItem
          key={id}
          selected={id == audioTrack}
          onClick={(): void => {
            selectTrack(id)
            handleClose()
          }}>
          {name}
        </MenuItem>
      ))

      return (<MenuList>{items}</MenuList>)
    }}
  />)
}

export default observer(AudioTrackSelector)
