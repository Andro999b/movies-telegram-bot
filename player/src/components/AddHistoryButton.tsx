import React, { useEffect, useState } from 'react'
import { IconButton } from '@material-ui/core'
import { Favorite, FavoriteBorder } from '@material-ui/icons'
import { observer } from 'mobx-react-lite'
import { watchHistoryStore } from '../store'
import { Playlist } from '../types'

interface Props {
  playlist: Playlist
}

const AddHistoryButton: React.FC<Props> = ({ playlist }: Props) => {
  const [inHistory, setInHistory] = useState(false)

  const onAddHistory = async (): Promise<void> => {
    await watchHistoryStore.watching(playlist)
    setInHistory(true)
  }

  const onDeleteHistory = async (): Promise<void> => {
    await watchHistoryStore.deleteFromHistory(playlist)
    setInHistory(false)
  }

  useEffect(() => {
    const fetch = async (): Promise<void> => {
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
}

export default observer(AddHistoryButton)
