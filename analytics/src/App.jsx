import React from 'react'
import { withLogin } from './components/Login'
import { Switch, Route, HashRouter as Router } from 'react-router-dom'
import Navigation from './components/Navigation'
import { CssBaseline } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import BotDashboardPage from './pages/BotDashboardPage'
import BotEventsPage from './pages/BotEventsPage'
import BotUsersPage from './pages/BotUsersPage'
import GADashboard from './pages/GADashboard'
import StorageDashboard from './pages/StorageDashboard'
import ErrorLogDashboard from './pages/ErrorLogDashboard'
import TopWatchesDashboard from './pages/TopWatchesDashboard'

const useStyles = makeStyles({
    root: {
        display: 'flex',
        height: '100%'
    },
    content: {
        flexGrow: 1,
        height: '100%'
    }
})

const App = () => {
    const classes = useStyles()

    return (<div className={classes.root}>
        <CssBaseline />
        <Router>
            <Navigation />
            <main className={classes.content} >
                <MuiPickersUtilsProvider utils={MomentUtils}>
                    <Switch>
                        <Route exact path="/">
                            <BotDashboardPage />
                        </Route>
                        <Route path="/events">
                            <BotEventsPage />
                        </Route>
                        <Route path="/ga">
                            <GADashboard />
                        </Route>
                        <Route path="/storage">
                            <StorageDashboard />
                        </Route>
                        <Route path="/errors">
                            <ErrorLogDashboard />
                        </Route>
                        <Route path="/users/:uid">
                            <BotUsersPage />
                        </Route>
                    </Switch>
                </MuiPickersUtilsProvider>
            </main>
        </Router>
    </div >)
}

export default withLogin(App)