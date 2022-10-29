import React, { useEffect, useState } from 'react'
import { IconButton } from '@material-ui/core'
import { Favorite, FavoriteBorder } from '@material-ui/icons'
import { observer } from 'mobx-react-lite'
import { watchHistoryStore } from '../store'

export default observer(({ playlist }) => {
  const [inHistory, setInHistory] = useState(false)

  const onAddHistory = async () => {
    await watchHistoryStore.watching(playlist)
    setInHistory(true)
  }

  const onDeleteHistory = async () => {
    const { provider, id } = playlist
    await watchHistoryStore.deleteFromHistory(`${provider}#${id}`)
    setInHistory(false)
  }

  useEffect(() => {
    const fetch = async () => {
      const item = await watchHistoryStore.getHistoryItem(playlist)
      setInHistory(item != null)
    }
    fetch()
  }, [playlist])

  return (
    <div className="add-history-btn">
      {inHistory ?
        <IconButton onClick={onDeleteHistory}>
          <Favorite />
        </IconButton> :
        <IconButton onClick={onAddHistory}>
          <FavoriteBorder />
        </IconButton>
      }
    </div>
  )
})
