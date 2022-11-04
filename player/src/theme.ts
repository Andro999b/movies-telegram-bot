import { createTheme } from '@mui/material/styles'
import { red, blue } from '@mui/material/colors'

export default createTheme({
  palette: {
    primary: {
      main: blue[600]
    },
    secondary: {
      main: red[400]
    },
    mode: 'dark'
  }
})
