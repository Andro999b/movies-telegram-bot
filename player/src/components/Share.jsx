import React, { useState } from 'react'
import Selector from './Selector'
import copy from 'clipboard-copy'
import {
  IconButton,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch
} from '@material-ui/core'
import {
  ShareRounded as ShareIcon,
  FileCopyRounded as CopyIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  WhatsApp as WhatsAppIcon,
  Telegram as TelegramIcon
} from '@material-ui/icons'
import { observer } from 'mobx-react-lite'

import analytics from '../utils/analytics'
import localization from '../localization'
import { notificationStore } from '../store'

export default observer(({ device, playlist }) => {
  const [sharePosition, setSharePosition] = useState(device !== undefined)
  const [shareTime, setShareTime] = useState(false)

  const getShareUrl = (sharePosition, shareTime) => {
    const { provider, id, query } = playlist
    const newParams = new URLSearchParams()

    newParams.set('provider', provider)
    newParams.set('id', decodeURIComponent(id))

    if (query) {
      newParams.set('query', query)
    }

    if (device !== undefined && sharePosition) {
      const { currentTime, currentFileIndex } = device

      newParams.set('file', currentFileIndex)

      if (shareTime) {
        newParams.set('time', Math.floor(currentTime))
      }
    }

    return encodeURIComponent(
      location.protocol + '//' + location.host + location.pathname +
      '#/watch?' + newParams.toString()
    )
  }

  const getTitle = (sharePosition) => {
    if (sharePosition) {
      return encodeURIComponent(document.title)
    } else {
      return encodeURIComponent(playlist.title)
    }
  }

  const handleShare = () => analytics('share')

  const handleCopy = (url) => {
    copy(decodeURIComponent(url))
    notificationStore.showMessage(localization.urlCopied)
  }

  const toggleSharePosition = () => setSharePosition(!sharePosition)
  const toggleShareTime = () => setShareTime(!shareTime)

  return (
    <div className="player__share">
      <Selector
        renderButton={({ handleOpen }) => (
          <IconButton onClick={handleOpen}>
            <ShareIcon />
          </IconButton>
        )}
        renderList={() => {
          const url = getShareUrl(sharePosition, shareTime)
          const title = getTitle(sharePosition)

          return (<div className="player__share-content">
            <Typography>
              {localization.shareWith}
            </Typography>
            <div>
              <a className="icon-share"
                href={`https://telegram.me/share/url?url=${url}&text=${title}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleShare('telegram')}
              >
                <TelegramIcon />
              </a>
              <a className="icon-share" href={`https://www.facebook.com/sharer/sharer.php?u=${url}&t=${title}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleShare('facebook')}
              >
                <FacebookIcon />
              </a>
              <a className="icon-share"
                href={`whatsapp://send?text=${title}%20$${url}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleShare('whatsapp')}
              >
                <WhatsAppIcon />
              </a>
              <a className="icon-share"
                href={`https://twitter.com/intent/tweet?text=${title}%20${url}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleShare('twitter')}
              >
                <TwitterIcon />
              </a>
              <a className="icon-share" onClick={() => handleCopy(url)}>
                <CopyIcon />
              </a>
            </div>
            {(device !== undefined) && <div>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={sharePosition}
                      onChange={toggleSharePosition}
                      color="primary"
                    />
                  }
                  label={localization.curPlaylistPos}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={shareTime}
                      onChange={toggleShareTime}
                      color="primary"
                    />
                  }
                  label={localization.curTimePos}
                />
              </FormGroup>
            </div>}
          </div>
          )
        }}
      />
    </div>
  )
})
