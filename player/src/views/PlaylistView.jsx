import { inject, observer } from 'mobx-react'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { isTouchDevice } from '../utils'
import analytics from '../utils/analytics'

import StartScrean from '../components/StartScrean'
import Player from '../components/Player'
import DualCirclesLoadr from '../components/DualCirclesLoadr'
import { Typography } from '@material-ui/core'
import AlternativeLinksError from '../components/AlternativeLinksError'

@inject(
    ({
        playlistStore: {
            loading,
            trailerUrl,
            playlist,
            error
        },
        playerStore: { openPlaylist },
        watchHistoryStore: { watching }
    }) => ({
        loading,
        trailerUrl,
        playlist,
        error,
        openPlaylist,
        watching
    })
)
@observer
class PlaylistView extends Component {

    state = { started: false, initialFullScreen: false }

    handleStartClick = () => {
        this.setState({ started: true })

        if (isTouchDevice()) {
            this.setState({ initialFullScreen: true })
        }

        const {
            openPlaylist,
            playlist,
            watching,
            fileIndex,
            time
        } = this.props

        openPlaylist(playlist, fileIndex, time)
        watching(playlist)

        analytics('start', document.title)
    }

    render() {
        const { loading, trailerUrl, playlist, error } = this.props

        const { started, initialFullScreen } = this.state

        if (loading) {
            return (<DualCirclesLoadr />)
        } else if (error) {
            if (playlist.query) {
                return (<AlternativeLinksError provider={playlist.provider} query={playlist.query} message={error} />)
            } else {
                return (<Typography className="center shadow-border" variant="h4">{error}</Typography>)
            }
        } else if (trailerUrl) {
            return (<iframe frameBorder="0" height="100%" width="100%" src={trailerUrl} />) // redirect??
        } else {
            if (!started) {
                return (
                    <StartScrean
                        playlist={playlist}
                        onStart={this.handleStartClick}
                    />
                )
            } else {
                return (
                    <div className="screan-content">
                        <Player initialFullScreen={initialFullScreen} />
                    </div>
                )
            }
        }
    }
}

PlaylistView.propTypes = {
    fileIndex: PropTypes.number,
    time: PropTypes.number,
    //load result
    loading: PropTypes.bool,
    error: PropTypes.string,
    trailerUrl: PropTypes.string,
    playlist: PropTypes.object,
    //actions
    watching: PropTypes.func,
    openPlaylist: PropTypes.func
}


@inject(({ playlistStore: { loadPlaylist } }) => ({ loadPlaylist }))
class PlaylistViewWrapper extends Component {
    render() {
        const { location } = this.props

        const urlParams = new URLSearchParams(location.search)

        const fileIndex = parseInt(urlParams.get('file'))
        const time = parseFloat(urlParams.get('time'))

        return (<PlaylistView fileIndex={fileIndex} time={time} />)
    }

    componentDidMount() {
        const { loadPlaylist } = this.props

        loadPlaylist(this.parseLocation(this.props))
    }

    componentDidUpdate(prevProps) {
        const cur = this.parseLocation(this.props)
        const prev = this.parseLocation(prevProps)

        if (prev.provider != cur.provider && prev.id != cur.id) {
            const { loadPlaylist } = this.props

            loadPlaylist(cur)
        }
    }

    parseLocation(props) {
        const { location } = props

        const urlParams = new URLSearchParams(location.search)

        const provider = urlParams.get('provider')
        const id = urlParams.get('id')
        const query = urlParams.get('query')

        return { provider, id, query }
    }
}

PlaylistViewWrapper.propTypes = {
    playlistStore: PropTypes.object,
    location: PropTypes.object,
    loadPlaylist: PropTypes.func,
}


export default PlaylistViewWrapper