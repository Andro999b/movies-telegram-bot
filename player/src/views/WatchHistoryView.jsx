import { inject, observer } from 'mobx-react'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
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

@inject('watchHistoryStore')
@observer
class WatchHistoryView extends Component {

    componentDidMount() {
        document.title = localization.watchHistory

        const { watchHistoryStore } = this.props
        watchHistoryStore.loadHistory()
    }

    onDelete = async (e, key) => {
        e.preventDefault()
        const { watchHistoryStore } = this.props

        await watchHistoryStore.deleteFromHistory(key)
        watchHistoryStore.loadHistory()
    }

    render() {
        const { history } = this.props.watchHistoryStore

        return (
            <div className="screan-content">
                {history == null ?
                    <DualCirclesLoader /> :
                    this.renderContent(history)
                }
            </div>
        )
    }

    renderTile({ image, key, provider, id, title }) {
        return (
            <Grid item xs={6} sm={4} lg={2} key={key}>
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
                                <IconButton color="primary" onClick={(e) => this.onDelete(e, key)}>
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

    renderNoHistory() {
        return <>
            <Typography className="center" variant="h4" style={{ width: '100%'}}>
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
    }

    renderContent() {
        const { insync, connect, disconnect, history } = this.props.watchHistoryStore

        return (
            <>
                <div className="watch-history__content">
                    <div className="watch-history__title">
                        <Typography variant="h4">
                            {localization.watchHistory}
                        </Typography>
                        <SyncButton insync={insync} onConnect={connect} onDisconnect={disconnect} />
                    </div>
                    {history.length == 0 && this.renderNoHistory()}
                    {history.length > 0 &&
                        <Grid container spacing={1} className="watch-history__tiles">
                            {history.map((item) => this.renderTile(item))}
                        </Grid>
                    }
                </div>
            </>
        )
    }
}

WatchHistoryView.propTypes = {
    watchHistoryStore: PropTypes.any
}

export default WatchHistoryView