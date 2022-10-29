import { observer } from 'mobx-react-lite'
import React, { useState, useMemo, useEffect } from 'react'
import { isTouchDevice } from '../utils'
import analytics from '../utils/analytics'

import StartScrean from '../components/StartScrean'
import Player from '../components/Player'
import DualCirclesLoader from '../components/DualCirclesLoader'
import HistoryNavButton from '../components/HistoryNavButton'
import { Typography } from '@material-ui/core'
import AlternativeLinksError from '../components/AlternativeLinksError'
import { addGlobalKey, removeGlobalKey } from '../utils/globalKeys'
import { playlistStore, watchHistoryStore, playerStore } from '../store'

const parseLocation = (location) => {
  const urlParams = new URLSearchParams(location.search)

  const provider = urlParams.get('provider')
  const id = urlParams.get('id')
  const query = urlParams.get('query')
  const fileIndex = parseInt(urlParams.get('file'))
  const time = parseFloat(urlParams.get('time'))

  return { provider, id, query, fileIndex, time }
}

export default observer(({ location }) => {
  const [started, setStarted] = useState()
  const [starting, setStarting] = useState()

  const { loading, trailerUrl, playlist, error } = playlistStore
  const params = useMemo(() => parseLocation(location), [location])

  useEffect(() => () => removeGlobalKey(['Space', 'Enter']), [])
  useEffect(() => playlistStore.loadPlaylist(params), [params])

  const handleStart = async () => {
    if (loading || started || starting) return

    setStarting(true)
    await playerStore.openPlaylist(playlist, params.fileIndex, params.time)

    setStarted(true)
    analytics('start')

    watchHistoryStore.watching(playlist)
  }
  addGlobalKey(['Space', 'Enter'], handleStart)

  const renderContent = () => {
    if (loading) {
      return (<DualCirclesLoader />)
    } else if (error) {
      return (
        <>
          <HistoryNavButton />
          {params.query ?
            <AlternativeLinksError provider={params.provider} query={params.query} message={error} /> :
            <Typography className="center shadow-border" variant="h4">{error}</Typography>
          }
        </>
      )
    } else if (trailerUrl) {
      return (
        <>
          <HistoryNavButton />
          <iframe frameBorder="0" height="100%" width="100%" src={trailerUrl} />
        </>
      )
    } else {
      if (!started) {
        return (
          <StartScrean
            starting={starting}
            playlist={playlist}
            onStart={handleStart}
          />
        )
      } else {
        return (
          <Player initialFullScreen={isTouchDevice()} />
        )
      }
    }
  }

  return (
    <div className="screan-content">
      {renderContent()}
    </div>
  )
})
