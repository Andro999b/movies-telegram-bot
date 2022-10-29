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


export default observer((device) => {
  const selectTrack = (id) => {
    device.setAudioTrack(id)
    analytics('select_audio')
  }

  return (<Selector
    renderButton={({ handleOpen }) => {
      if (isTouchDevice()) {
        return (
          <IconButton onClick={handleOpen}>
            <AudioTrackIcon />
          </IconButton>
        )
      } else {
        const { audioTrack, audioTracks } = device
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
    renderList={({ handleClose }) => {
      const { audioTrack, audioTracks } = device

      const items = audioTracks.map(({ id, name }) => (
        <MenuItem
          key={id}
          selected={id == audioTrack}
          onClick={() => {
            selectTrack(id)
            handleClose()
          }}>
          {name}
        </MenuItem>
      ))

      return (<MenuList>{items}</MenuList>)
    }}
  />)
})
