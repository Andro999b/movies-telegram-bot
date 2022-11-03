import React from 'react'
import { Switch } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import { PlayArrow, Pause } from '@material-ui/icons'
import { observer } from 'mobx-react-lite'
import { Device } from '../store/player-store'

const thumbStyle = {
  width: 20,
  height: 20,
  borderRadius: '50%',
  lineHeight: '20px'
}

interface Props {
  device: Device
}

const AutoPlaySwitcher: React.FC<Props> = ({ device }) => {

  const renderThumbIcon = (checked: boolean): React.ReactElement => (
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
      onChange={(e): void => device.setAutoPlay(e.currentTarget.checked)}
    />
  )
}

export default observer(AutoPlaySwitcher)
