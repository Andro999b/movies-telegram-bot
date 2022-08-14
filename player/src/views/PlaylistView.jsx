import { inject, observer } from 'mobx-react'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { isTouchDevice } from '../utils'
import analytics from '../utils/analytics'

import StartScrean from '../components/StartScrean'
import Player from '../components/Player'
import DualCirclesLoader from '../components/DualCirclesLoader'
import HistoryNavButton from '../components/HistoryNavButton'
import { Typography } from '@material-ui/core'
import AlternativeLinksError from '../components/AlternativeLinksError'
import { addGlobalKey, removeGlobalKey } from '../utils/globalKeys'

@inject(
    ({
        playlistStore: {
            loading,
            trailerUrl,
            playlist,
            error,
            loadPlaylist
        },
        playerStore: { openPlaylist },
        watchHistoryStore: { watching }
    }) => ({
        loading,
        trailerUrl,
        playlist,
        error,
        openPlaylist,
        watching,
        loadPlaylist
    })
)
@observer
class PlaylistView extends Component {

    state = { started: false, initialFullScreen: false }
    fileIndex = 0
    time = 0

    handleStart = () => {
        const { loading, openPlaylist, playlist, watching } = this.props
        const { started } = this.state
        if(loading || started) return

        openPlaylist(playlist, this.fileIndex, this.time)
            .then(() => {
                this.setState({ 
                    started: true, 
                    initialFullScreen: isTouchDevice()
                })
                analytics('start', document.title)
            })

        watching(playlist)
    }

    componentWillUnmount() {
        removeGlobalKey(['Space', 'Enter'])
    }


    componentDidMount() {
        const { loadPlaylist } = this.props
        const cur = this.parseLocation(this.props)

        this.fileIndex = cur.fileIndex
        this.time = cur.time

        loadPlaylist(cur)

        addGlobalKey(['Space', 'Enter'], this.handleStart)
    }

    componentDidUpdate(prevProps) {
        const cur = this.parseLocation(this.props)
        const prev = this.parseLocation(prevProps)

        if (prev.provider != cur.provider && prev.id != cur.id) {
            const { loadPlaylist } = this.props

            this.fileIndex = cur.fileIndex
            this.time = cur.time

            loadPlaylist(cur)
        }
    }

    parseLocation(props) {
        const { location } = props

        const urlParams = new URLSearchParams(location.search)

        const provider = urlParams.get('provider')
        const id = urlParams.get('id')
        const query = urlParams.get('query')
        const fileIndex = parseInt(urlParams.get('file'))
        const time = parseFloat(urlParams.get('time'))

        return { provider, id, query, fileIndex, time }
    }

    render() {
        const content = this.renderContent()

        return (
            <div className="screan-content">
                {content}
            </div>
        )
    }

    renderContent() {
        const { loading, trailerUrl, playlist, error } = this.props

        const { started, initialFullScreen } = this.state

        if (loading) {
            return (<DualCirclesLoader />)
        } else if (error) {
            const { query, provider } = this.parseLocation(this.props)
            return (
                <>
                    <HistoryNavButton showLabel/>
                    {query ?
                        <AlternativeLinksError provider={provider} query={query} message={error} /> :
                        <Typography className="center shadow-border" variant="h4">{error}</Typography>
                    }
                </>
            )
        } else if (trailerUrl) {
            return (
                <>
                    <HistoryNavButton showLabel/>
                    <iframe frameBorder="0" height="100%" width="100%" src={trailerUrl} />
                </>
            ) // redirect??
        } else {
            if (!started) {
                return (
                    <StartScrean
                        playlist={playlist}
                        onStart={this.handleStart}
                    />
                )
            } else {
                return (
                    <Player initialFullScreen={initialFullScreen} />
                )
            }
        }
    }
}

PlaylistView.propTypes = {
    //load result
    loading: PropTypes.bool,
    error: PropTypes.string,
    trailerUrl: PropTypes.string,
    playlist: PropTypes.object,
    loadPlaylist: PropTypes.func,
    //actions
    watching: PropTypes.func,
    openPlaylist: PropTypes.func,
    //router
    location: PropTypes.object
}

export default PlaylistView