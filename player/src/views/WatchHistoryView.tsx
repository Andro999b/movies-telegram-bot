import { observer } from 'mobx-react-lite'
import React, { useEffect, MouseEvent } from 'react'
import DualCirclesLoader from '../components/DualCirclesLoader'

import {
  Grid,
  IconButton,
  Typography
} from '@mui/material'
import { Link } from 'react-router-dom'

import localization from '../localization'
import { Delete } from '@mui/icons-material'
import SyncButton from '../components/SyncButton'
import { tgBots } from '../utils'
import { watchHistoryStore } from '../store'
import { HistoryItem } from '../store/watch-history-store'

interface TileProps {
  item: HistoryItem
  onDelete: (item: HistoryItem) => void
}

const Tile: React.FC<TileProps> = ({ item, onDelete }) => {
  const { image, provider, id, title } = item

  return (
    <Grid item xs={6} sm={4} lg={2}>
      <div className="watch-history__tile">
        <Link to={`/watch?provider=${provider}&id=${id}&query=${encodeURIComponent(title)}`}>
          <img className="watch-history__tile-image" src={image} />
          <div className="watch-history__tile-title">
            <div className="watch-history__tile-title-text">
              <Typography>
                [{provider}] {title}
              </Typography>
            </div>
            <div className="watch-history__tile-title-delete">
              <IconButton
                color="secondary"
                onClick={(e: MouseEvent): void => {
                  e.preventDefault()
                  onDelete(item)
                }}
                size="large">
                <Delete />
              </IconButton>
            </div>
          </div>
        </Link>
      </div>
    </Grid>
  )
}

const NoHistory: React.FC = () => (
  <>
    <Typography className="center" variant="h4" style={{ width: '100%' }}>
      <div>
        {localization.noWatchHistory.title}
      </div>
      <div>
        {localization.noWatchHistory.subtitle}
      </div>
      {tgBots.map((bot) => (
        <div key={bot}>
          <a href={`https://telegram.me/${bot}`} rel="noreferrer" target="_blank">@{bot}</a>
        </div>
      ))}
    </Typography>
  </>
)


const WatchHistoryView: React.FC = () => {
  const { history, insync, connect, disconnect, deleteFromHistory, loadHistory } = watchHistoryStore

  const onDelete = async (item: HistoryItem): Promise<void> => {
    await deleteFromHistory(item)
    loadHistory()
  }

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  useEffect(() => {
    document.title = localization.watchHistory
  }, [])

  return (
    <div className="screan-content animated-bg">
      <div className="watch-history__content">
        <div className="watch-history__title">
          <Typography variant="h4">
            {localization.watchHistory}
          </Typography>
          <SyncButton insync={insync} onConnect={connect} onDisconnect={disconnect} />
        </div>
        {history == null ?
          <DualCirclesLoader /> :
          <>
            {history.length == 0 && <NoHistory />}
            {history.length > 0 &&
              <Grid container spacing={1} className="watch-history__tiles">
                {history.map((item) => <Tile
                  key={`${item.provider}#${item.id}`}
                  item={item}
                  onDelete={onDelete} />
                )}
              </Grid>}
          </>}
      </div>
    </div>
  )
}

export default observer(WatchHistoryView)
