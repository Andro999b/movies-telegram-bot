import './styles.scss'
import React, { Component } from 'react'
import { createMuiTheme } from '@material-ui/core/styles'
import { red } from '@material-ui/core/colors'
import { Provider } from 'mobx-react'

import PlayerView from './views/PlayerView'
import stores from './store'

import { ThemeProvider } from '@material-ui/styles'

const theme = createMuiTheme({
    palette: {
        secondary: {
            light: red.A200,
            main: red[500],
            dark: red[900],
            contrastText: '#fff'
        },
        primary: {
            light: red.A200,
            main: red[500],
            dark: red[900],
            contrastText: '#fff'
        },
        type: 'dark'
    },
    typography: {
        useNextVariants: true
    },
    overrides: {
        MuiLinearProgress: {
            colorSecondary: {
                backgroundColor: 'transparent'
            }
        },
        MuiMenuItem: {
            root: {
                height: 'initial'
            }
        },
        MuiListItemIcon: {
            root: {
                marginRight: 0,
                minWidth: '30px'
            }
        },
        MuiList: {
            padding: {
                paddingTop: 0,
                paddingBottom: 0
            }
        },
        MuiDrawer: {
            paper: {
                minWidth: '100%',
                '@media (min-width:600px)': {
                    minWidth: '40%',
                }
            }
        }
    }
})

class App extends Component {
    render() {
        return (
            <ThemeProvider theme={theme}>
                <Provider {...stores}>
                    <PlayerView/>
                </Provider>
            </ThemeProvider>
        )
    }
}

export default App