import React from 'react'
import { Typography, Container } from '@mui/material'

import makeStyles from '@mui/styles/makeStyles'

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(2)
  },
  error: {
    color: theme.palette.error.dark,
    textAlign: 'center'
  }
}))

interface Props {
  error: string | null
  children: React.ReactElement
  Wrapper?: React.ElementType
}

const ErrorAwareContainer: React.FC<Props> = ({ error, children, Wrapper = Container }) => {
  const classes = useStyles()

  if (error) {
    return (
      <Wrapper className={classes.container}>
        <Typography className={classes.error}>{error}</Typography>
      </Wrapper>
    )
  } else {
    return children
  }

}
export default ErrorAwareContainer

