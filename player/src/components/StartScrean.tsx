import React from 'react'

import { PlayCircleFilled as PlayIcon } from '@mui/icons-material'

import Share from './Share'
import { CircularProgress, Typography } from '@mui/material'
import { Playlist } from '../types'
import AddHistoryButton from './AddHistoryButton.js'

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
        className="player__start"
        onClick={onStart}
      >
        <img className="player__start-cover" src={image} />
        {starting && <div className="loader-indicator center"><CircularProgress /></div>}
        {!starting && <PlayIcon className="center shadow-icon" fontSize="inherit" />}
      </div>
      <Share playlist={playlist} />
      <AddHistoryButton playlist={playlist} />
      <div className='shutdown_notification'>
        <Typography variant='h5'>Цей плеєр більше не підтримується та буде вимкнений найближчим часом. Скористайтесь альтернативним додатком <a href='https://strumokapp.cc/'>Strumok</a></Typography>
      </div>
    </>
  )
}


export default StartScrean
