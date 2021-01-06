import { inject } from 'mobx-react'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import DualCirclesLoader from '../components/DualCirclesLoader'

import {
    Grid,
    Typography
} from '@material-ui/core'

import TelegramLinks from '../components/TelegramLinks'
import { Link } from 'react-router-dom'

import localization from '../localization'

@inject('watchHistoryStore')
class WatchHistoryView extends Component {

    state = {
        history: null
    }

    componentDidMount() {
        const { watchHistoryStore } = this.props
        watchHistoryStore
            .getHistory()
            .toArray()
            .then((history) => this.setState({ history }))
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
                        <div className="watch-history__tile-image" style={{ backgroundImage: `url(${image})` }}/>
                        <div className="watch-history__tile-title">
                            <Typography>
                                {title}
                            </Typography>
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
                    <Grid container spacing={1}>
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