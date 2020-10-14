import React from 'react'
import { observer } from 'mobx-react-lite'
import {
    Typography,
    Toolbar,
    makeStyles,
    Box,
    Container
} from '@material-ui/core'
import DateSelector from '../components/DateSelector'
import dashboard from '../store/errorsLogDashboard'
import ReloadButton from '../components/ReloadButton'
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import LogsTable from '../components/LogsTable'
import periodStore from '../store/periodStore'
import { red } from '@material-ui/core/colors'

const useStyles = makeStyles((theme) => ({
    title: {
        flexGrow: 1
    },
    logs: {
        marginTop: theme.spacing(2)
    },
    error: {
        color: red[900],
        textAlign: 'center'
    }
}))

export default observer(() => {
    const classes = useStyles()

    const store = React.useRef(dashboard).current
    const curPeriodStore = React.useRef(periodStore).current

    React.useEffect(() => store.reload(), []) //eslint-disable-line

    return (<div>
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
        <Container className={classes.logs}>
            {store.searcher?.error  && <Typography className={classes.error}>{store.searcher.error}</Typography>}
            <LoadingPlaceholder loading={store.searcher?.loading}>
                {store.searcher && <LogsTable rows={store.searcher.logs} />}
            </LoadingPlaceholder>
        </Container>
        <ReloadButton onClick={() => store.reload(true)} />
    </div>)
})