import React from 'react'

import { Typography } from '@material-ui/core'
import HistoryNavButton from './HistoryNavButton'

interface Props {
  title: string
}

const PlayerTitle: React.FC<Props> = ({ title }) => (
  <>
    <HistoryNavButton />
    <div className="player__title">
      <Typography variant="h6" style={{ wordBreak: 'break-all' }}>
        {title}
      </Typography>
    </div>
  </>
)

export default PlayerTitle
