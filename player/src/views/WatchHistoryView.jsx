import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import DualCirclesLoader from '../components/DualCirclesLoader'

import {
  Grid,
  IconButton,
  Typography
} from '@material-ui/core'
import { Link } from 'react-router-dom'

import localization from '../localization'
import { Delete } from '@material-ui/icons'
import SyncButton from '../components/SyncButton'
import { tgBots } from '../utils'
import { watchHistoryStore } from '../store'

const Tile = ({ item, onDelete }) => {
  const { image, provider, id, title } = item

  return (
    <Grid item xs={6} sm={4} lg={2}>
      <div className="watch-history__tile">
        <Link to={`/watch?provider=${provider}&id=${id}&query=${encodeURIComponent(title)}`}>
          <div className="watch-history__tile-image" style={{ backgroundImage: `url(${image})` }} />
          <div className="watch-history__tile-title">
            <div className="watch-history__tile-title-text">
              <Typography>
                [{provider}] {title}
              </Typography>
            </div>
            <div className="watch-history__tile-title-delete">
              <IconButton color="primary" onClick={(e) => {
                e.preventDefault()
                onDelete(item)
              }}>
                <Delete />
              </IconButton>
            </div>
          </div>
        </Link>
        <div className="watch-history__tile-aspect-ratio"></div>
      </div>
    </Grid>
  )
}

const NoHistory = () => (
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


export default observer(() => {
  const { history, insync, connect, disconnect, deleteFromHistory, loadHistory } = watchHistoryStore

  const onDelete = async (item) => {
    await deleteFromHistory(item)
    loadHistory()
  }

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  return (
    <div className="screan-content">
      {history == null ?
        <DualCirclesLoader /> :
        <>
          <div className="watch-history__content">
            <div className="watch-history__title">
              <Typography variant="h4">
                {localization.watchHistory}
              </Typography>
              <SyncButton insync={insync} onConnect={connect} onDisconnect={disconnect} />
            </div>
            {history.length == 0 && <NoHistory />}
            {history.length > 0 &&
              <Grid container spacing={1} className="watch-history__tiles">
                {history.map((item) =>
                  <Tile
                    key={`${item.provider}#${item.id}`}
                    item={item}
                    onDelete={onDelete}
                  />
                )}
              </Grid>
            }
          </div>
        </>
      }
    </div>
  )
})
