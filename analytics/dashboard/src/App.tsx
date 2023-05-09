import React from 'react'
import { withLogin } from './components/Login'
import { Switch, Route, HashRouter as Router } from 'react-router-dom'
import Navigation from './components/Navigation'
import { CssBaseline } from '@mui/material'
import { ThemeProvider, Theme, StyledEngineProvider } from '@mui/material/styles'
import makeStyles from '@mui/styles/makeStyles'
import BotDashboardPage from './pages/BotDashboardPage'
import BotEventsPage from './pages/BotEventsPage'
import BotUsersPage from './pages/BotUsersPage'
import GADashboard from './pages/GADashboard'
import StorageDashboard from './pages/StorageDashboard'
import ErrorLogDashboard from './pages/ErrorLogDashboard'
import theme from './theme'



declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme { }
}

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme { }
}


const useStyles = makeStyles({
  root: {
    display: 'flex',
    height: '100%'
  },
  content: {
    flexGrow: 1,
    height: '100%',
    overflowX: 'hidden'
  }
})

const Main = withLogin(() => {
  const classes = useStyles()

  return (<div className={classes.root}>
    <CssBaseline />
    <Router>
      <Navigation />
      <main className={classes.content} >
        <Switch>
          <Route exact path="/">
            <BotDashboardPage />
          </Route>
          <Route path="/events">
            <BotEventsPage />
          </Route>
          <Route path="/users/:uid">
            <BotUsersPage />
          </Route>
          <Route path="/errors">
            <ErrorLogDashboard />
          </Route>
          <Route path="/storage">
            <StorageDashboard />
          </Route>
          <Route path="/ga">
            <GADashboard />
          </Route>
        </Switch>
      </main>
    </Router>
  </div >)
})

const App: React.FC = () => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <Main />
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

export default App
