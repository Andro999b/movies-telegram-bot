import { inject } from 'mobx-react'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import DualCirclesLoader from '../components/DualCirclesLoader'

import {
    Grid,
    IconButton,
    Typography
} from '@material-ui/core'

import TelegramLinks from '../components/TelegramLinks'
import { Link } from 'react-router-dom'

import localization from '../localization'
import { Delete } from '@material-ui/icons'

@inject('watchHistoryStore')
class WatchHistoryView extends Component {

    state = {
        history: null
    }

    componentDidMount() {
        this.reloadHistory()
    }

    reloadHistory() {
        const { watchHistoryStore } = this.props
        watchHistoryStore
            .getHistory()
            .toArray()
            .then((history) => this.setState({ history }))
    }

    onDelete = (e, key) => {
        e.preventDefault()

        const { watchHistoryStore } = this.props
        this.setState({ history: null })

        watchHistoryStore.delete(key)
            .then(() => this.reloadHistory())
    }

    render() {
        const { history } = this.state

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
            <Grid item xs={6} md={2} key={key}>
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
                </div>
            </Grid>
        )
    }


    renderContent(history) {
        return (
            <>
                <div className="watch-history__title">
                    <Typography variant="h4">
                        {localization.watchHistory}
                    </Typography>
                </div>
                <div className="watch-history__content">
                    <Grid container spacing={1} className="watch-history__tiles">
                        {history.map((item) => this.renderTile(item))}
                    </Grid>
                </div>
                <TelegramLinks />
            </>
        )
    }
}

WatchHistoryView.propTypes = {
    watchHistoryStore: PropTypes.any
}

export default WatchHistoryView