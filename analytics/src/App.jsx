import React from 'react';
import { withLogin } from './components/Login'
import { Switch, Route, HashRouter as Router } from 'react-router-dom';
import Navigation from './components/Navigation';
import { CssBaseline } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles'
import BotDashboardPage from './pages/BotDashboardPage'
import BotEventsPage from './pages/BotEventsPage';
import BotUsersPage from './pages/BotUsersPage';


const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        height: '100%'
    },
    content: {
        flexGrow: 1,
        height: '100%'
    }
}))

const App = () => {
    const classes = useStyles()

    return (<div className={classes.root}>
        <CssBaseline />
        <Router>
            <Navigation />
            <main className={classes.content} >
                <Switch>
                    <Route exact path="/">
                        <BotDashboardPage/>
                    </Route>
                    <Route path="/events">
                        <BotEventsPage/>
                    </Route>
                    <Route path="/users/:uid">
                        <BotUsersPage/>
                    </Route>
                </Switch>
            </main>
        </Router>
    </div >)
}

export default withLogin(App);