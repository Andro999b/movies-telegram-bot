import React from 'react'

import { PlayCircleFilled as PlayIcon } from '@mui/icons-material'

import Share from './Share'
import HistoryNavButton from './HistoryNavButton'
import TelegramLinks from './TelegramLinks'
import AddHistoryButton from './AddHistoryButton'
import analytics from '../utils/analytics'
import localization from '../localization'
import { CircularProgress } from '@mui/material'
import { Playlist } from '../types'

interface Props {
  starting: boolean
  playlist: Playlist
  onStart: () => void
}

const StartScrean: React.FC<Props> = ({ starting, playlist, onStart }) => {
  const { image } = playlist

  return (
    <>
      <div
        className="player__pause-cover player__background-cover"
        style={{ backgroundImage: image ? `url(${image})` : undefined, cursor: 'pointer' }}
        onClick={onStart}
      >
        {starting && <div className="loader-indicator center"><CircularProgress /></div>}
        {!starting && <PlayIcon className="center shadow-icon" fontSize="inherit" />}
      </div>
      <a className='save-ukraine'
        href='https://savelife.in.ua/'
        target='_blank'
        rel="noreferrer"
        onClick={(): void => analytics('save_ukraine')}
      >
        {localization.saveUkraine}
      </a>
      <HistoryNavButton />
      <Share playlist={playlist} />
      <AddHistoryButton playlist={playlist} />
      <TelegramLinks />
    </>
  )
}


export default StartScrean
