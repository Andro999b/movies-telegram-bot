import React from 'react'
import { observer } from 'mobx-react-lite'
import { Typography, Toolbar, Box, Container } from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import DateSelector from '../components/DateSelector'
import dashboard from '../store/errorsLogDashboard'
import ReloadButton from '../components/ReloadButton'
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import ErrorAwareContainer from '../components/ErrorAwareContainer'
import LogsTable from '../components/LogsTable'
import periodStore from '../store/periodStore'

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100%',
    flexGrow: 1,
    marginBottom: theme.spacing(10)
  },
  title: {
    flexGrow: 1
  },
  logs: {
    marginTop: theme.spacing(2)
  },
  error: {
    color: theme.palette.error.dark,
    textAlign: 'center'
  }
}))

const ErrorLogDashboard: React.FC = () => {
  const classes = useStyles()

  React.useEffect(() => dashboard.reload(), [])

  return (<div className={classes.root}>
    <Toolbar>
      <Box className={classes.title}>
        <Typography>Errors log</Typography>
        {dashboard.searcher?.statistics &&
          <Typography>
            Records Scanned: <b>{dashboard.searcher.statistics.recordsScanned}</b> Matched: <b>{dashboard.searcher.statistics.recordsMatched}</b>
          </Typography>}
      </Box>
      <DateSelector value={periodStore.period} onChange={(p): void => dashboard.load(p)} />
    </Toolbar>
    <ErrorAwareContainer error={dashboard.searcher?.error ?? null}>
      <Container className={classes.logs}>
        <LoadingPlaceholder loading={dashboard.searcher?.loading ?? false}>
          <>
            {dashboard.searcher && <LogsTable rows={dashboard.searcher.logs} />}
          </>
        </LoadingPlaceholder>
      </Container>
    </ErrorAwareContainer>
    <ReloadButton onClick={(): void => dashboard.reload(true)} />
  </div>)
}

export default observer(ErrorLogDashboard)
