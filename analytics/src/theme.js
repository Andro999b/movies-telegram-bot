import { createMuiTheme } from '@material-ui/core/styles'


// A custom theme for this app
const theme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#58A6FF',
            contrastText: '#fff'
        }
    }
})

export default theme