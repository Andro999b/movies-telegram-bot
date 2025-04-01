import { observer } from 'mobx-react-lite'
import React, { useState, useMemo, useEffect } from 'react'
import { Location } from 'history'
import { isTouchDevice } from '../utils'
import analytics from '../utils/analytics'

import StartScrean from '../components/StartScrean'
import Player from '../components/Player'
import DualCirclesLoader from '../components/DualCirclesLoader'
import HistoryNavButton from '../components/HistoryNavButton'
import { Typography } from '@mui/material'
import AlternativeLinksError from '../components/AlternativeLinksError'
import { addGlobalKey, removeGlobalKey } from '../utils/globalKeys'
import { playlistStore, watchHistoryStore, playerStore } from '../store'
import { useLocation } from 'react-router-dom'
import TelegramLinks from '../components/TelegramLinks.js'
import Trailer from '../components/Trailer.js'

interface ParsedLocation {
  provider: string
  id: string
  query: string | null
  fileIndex: number | null
  time: number | null
}

const parseLocation = (location: Location): ParsedLocation => {
  const urlParams = new URLSearchParams(location.search)

  const provider = urlParams.get('provider') ?? ''
  const id = urlParams.get('id') ?? ''
  const query = urlParams.get('query')
  const fileIndex = urlParams.has('file') ? parseInt(urlParams.get('file')!) : null
  const time = urlParams.has('time') ? parseFloat(urlParams.get('time')!) : null

  return { provider, id, query, fileIndex, time }
}

const PlaylistView: React.FC = () => {
  const [started, setStarted] = useState(false)
  const [starting, setStarting] = useState(false)

  const location = useLocation()

  const { loading, trailerUrl, playlist, error } = playlistStore
  const params = useMemo(() => parseLocation(location), [location])

  useEffect(() => () => removeGlobalKey(['Space', 'Enter']), [])
  useEffect(() => playlistStore.loadPlaylist(params), [params])
  useEffect(() => {
    if (playlist) {
      document.title = playlist.title
    }
  }, [playlist])

  const handleStart = async (): Promise<void> => {
    if (loading || started || starting)
      return

    setStarting(true)
    await playerStore.openPlaylist(playlist, params.fileIndex, params.time)

    setStarted(true)
    analytics('start')

    watchHistoryStore.watching(playlist!)
  }

  addGlobalKey(['Space', 'Enter'], handleStart)

  if (started) {
    return <div className="screan-content">
      <Player initialFullScreen={isTouchDevice()} />
    </div>
  }

  const renderContent = (): React.ReactNode => {
    if (loading) {
      return (<DualCirclesLoader />)
    } else if (error) {
      return (
        <>
          {params.query ?
            <AlternativeLinksError provider={params.provider} query={params.query} message={error} /> :
            <Typography className="center shadow-border" variant="h4">{error}</Typography>}
        </>
      )
    } else if (trailerUrl) {
      return (<Trailer trailerUrl={trailerUrl} />)
    } else {
      return (
        <StartScrean
          starting={starting}
          playlist={playlist}
          onStart={handleStart} />
      )
    }
  }

  return (
    <div className="screan-content gradient-bg">
      <HistoryNavButton />
      {renderContent()}
      <div className='shutdown_notification'>
        <Typography variant='h5'>Цей плеєр більше не підтримується та буде вимкнений найближчим часом. Скористайтесь альтернативним додатком <a href='https://strumokapp.cc/'>Strumok</a></Typography>
      </div>
    </div>
  )
}

export default observer(PlaylistView)
