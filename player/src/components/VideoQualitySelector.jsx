import React from 'react'
import { observer } from 'mobx-react-lite'
import Selector from './Selector'
import {
  Button,
  MenuItem,
  MenuList
} from '@material-ui/core'
import analytics from '../utils/analytics'

export default observer(({ device }) => {
  const { quality, qualities } = device

  return (
    <Selector
      renderButton={({ handleOpen }) => (
        <Button onClick={handleOpen}>
          {quality ? quality : 'Auto'}
        </Button>
      )}
      renderList={({ handleClose }) => {
        const selectQuality = (quality) => {
          device.setQuality(quality)
          handleClose()

          analytics('select_quality')
        }

        return (
          <MenuList>{qualities
            .map((id) => (
              <MenuItem key={id} selected={id == quality} onClick={() => selectQuality(id)}>
                {id}
              </MenuItem>
            ))
            .concat([
              <MenuItem key="auto" selected={quality == null} onClick={() => selectQuality(null)}>
                Auto
              </MenuItem>
            ])}</MenuList>
        )
      }}
    />
  )
})
