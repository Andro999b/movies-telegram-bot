import './styles.scss'
import 'react-virtualized/styles.css'
import React, { Component } from 'react'
import { Provider } from 'mobx-react'

import { HashRouter, Route, Switch } from 'react-router-dom'

import Notification from './components/Notification'
import PlaylistView from './views/PlaylistView'
import WatchHistoryView from './views/WatchHistoryView'
import stores from './store'
import logger from './utils/logger'

import { ThemeProvider } from '@material-ui/styles'
import theme from './theme'

class App extends Component {

    componentDidCatch(error) {
        logger.error(error.message, {
            title: document.title,
            url: location.href
        })
    }

    render() {
        return (
            <ThemeProvider theme={theme}>
                <Provider {...stores}>
                    <HashRouter>
                        <Switch>
                            <Route exact path="/watch" component={PlaylistView}/>
                            <Route path="/">
                                <WatchHistoryView/>
                            </Route>
                        </Switch>
                    </HashRouter>
                    <Notification />
                </Provider>
            </ThemeProvider>
        )
    }
}

export default App