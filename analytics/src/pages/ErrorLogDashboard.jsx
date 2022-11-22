import React from 'react'
import { observer } from 'mobx-react-lite'
import { Typography, Toolbar, Box, Container } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import DateSelector from '../components/DateSelector'
import dashboard from '../store/errorsLogDashboard'
import ReloadButton from '../components/ReloadButton'
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import ErrorAwareContainer from '../components/ErrorAwareContainer'
import LogsTable from '../components/LogsTable'
import periodStore from '../store/periodStore'

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight:'100%',
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

export default observer(() => {
    const classes = useStyles()

    const store = React.useRef(dashboard).current
    const curPeriodStore = React.useRef(periodStore).current

    React.useEffect(() => store.reload(), []) //eslint-disable-line

    return (<div className={classes.root}>
        <Toolbar>
            <Box className={classes.title}>
                <Typography>Errors log</Typography>
                {store.searcher?.statistics &&
                    <Typography>
                        Records Scanned: <b>{store.searcher.statistics.recordsScanned}</b> Matched: <b>{store.searcher.statistics.recordsMatched}</b>
                    </Typography>
                }
            </Box>
            <DateSelector value={curPeriodStore.period} onChange={(p) => store.load(p)} />
        </Toolbar>
        <ErrorAwareContainer error={store.searcher?.error}>
            <Container className={classes.logs}>
                <LoadingPlaceholder loading={store.searcher?.loading}>
                    {store.searcher && <LogsTable rows={store.searcher.logs} />}
                </LoadingPlaceholder>
            </Container>
        </ErrorAwareContainer>
        <ReloadButton onClick={() => store.reload(true)} />
    </div>)
})