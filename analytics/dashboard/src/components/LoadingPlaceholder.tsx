import React from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import makeStyles from '@mui/styles/makeStyles'

const useStyle = makeStyles(() => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%'
  }
}))

interface Props {
  children: JSX.Element
  loading: boolean
}

const LoadingPlaceholder: React.FC<Props> = ({ children, loading }): JSX.Element => {
  const classes = useStyle()

  if (loading) {
    return (
      <div className={classes.container}>
        <CircularProgress />
      </div>
    )
  }

  return children
}
export default LoadingPlaceholder
