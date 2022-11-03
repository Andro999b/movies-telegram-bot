import './styles.scss'
import React, { Component } from 'react'

import { HashRouter, Route, Switch } from 'react-router-dom'

import Notification from './components/Notification'
import PlaylistView from './views/PlaylistView'
import WatchHistoryView from './views/WatchHistoryView'
import logger from './utils/logger'

import { ThemeProvider } from '@material-ui/styles'
import theme from './theme'

class App extends Component {

  componentDidCatch(error: Error): void {
    logger.error(error.message, {
      title: document.title,
      url: location.href,
      stack: error.stack
    })
  }

  render(): React.ReactNode {
    return (
      <ThemeProvider theme={theme}>
        <HashRouter>
          <Switch>
            <Route exact path="/watch" component={PlaylistView} />
            <Route path="/" component={WatchHistoryView} />
          </Switch>
        </HashRouter>
        <Notification />
      </ThemeProvider>
    )
  }
}

export default App
