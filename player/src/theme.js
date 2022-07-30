import { createTheme } from '@material-ui/core/styles'
import { red, grey } from '@material-ui/core/colors'

export default createTheme({
    palette: {
        secondary: {
            light: grey.A200,
            main: grey[700],
            dark: grey[900],
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