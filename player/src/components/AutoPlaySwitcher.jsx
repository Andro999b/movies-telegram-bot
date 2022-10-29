import React from 'react'
import { Switch } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import { PlayArrow, Pause } from '@material-ui/icons'
import { observer } from 'mobx-react-lite'

const thumbStyle = {
  width: 20,
  height: 20,
  borderRadius: '50%',
  lineHeight: '20px'
}

export default observer(({ device }) => {

  const renderThumbIcon = (checked) => (
    <span style={{ ...thumbStyle, backgroundColor: checked ? '#fff' : grey[700] }}>
      {checked ?
        <PlayArrow fontSize='small' htmlColor={grey[700]} /> :
        <Pause fontSize='small' htmlColor='#fff' />
      }
    </span>
  )

  return (
    <Switch
      checked={device.autoPlay}
      checkedIcon={renderThumbIcon(true)}
      icon={renderThumbIcon(false)}
      onChange={(e) => device.setAutoPlay(e.currentTarget.checked)}
    />
  )
})
