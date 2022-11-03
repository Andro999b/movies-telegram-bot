import React from 'react'
import { Link } from 'react-router-dom'

import { Fab, Tooltip } from '@material-ui/core'
import { History as HistoryIcon } from '@material-ui/icons'
import localization from '../localization'

const HistoryNavButton: React.FC = () => (
  <div className="history-nav">
    <Link to="/">
      <Tooltip title={localization.watchHistory} placement="right">
        <Fab variant={'circular'} size="medium">
          <HistoryIcon />
        </Fab>
      </Tooltip>
    </Link>
  </div>
)

export default HistoryNavButton
