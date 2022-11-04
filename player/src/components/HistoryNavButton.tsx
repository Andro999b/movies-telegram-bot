import React from 'react'
import { Link } from 'react-router-dom'

import { Fab, Tooltip } from '@mui/material'
import { History as HistoryIcon } from '@mui/icons-material'
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
