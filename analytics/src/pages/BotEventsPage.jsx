import React from 'react'
import {
    Toolbar,
    Typography,
    makeStyles,
    Box,
    Container,
    TextField
} from '@material-ui/core'
import botEvents from '../store/botEvents'
import EventsTable from '../components/EventsTable'
import ReloadButton from '../components/ReloadButton'
import { observer } from 'mobx-react-lite'
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import { DatePicker } from '@material-ui/pickers'
import periodStore from '../store/periodStore'

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    },
    title: {
        flexGrow: 1
    },
    filter: {
        display: 'flex',
        marginBottom: theme.spacing(2)
    },
    filterInput: {
        flexGrow: 1,
        backgroundColor: '#FFF',
        marginRight: theme.spacing(2)
    },
    dataPicker: {
        backgroundColor: '#FFF',
        width: 110
    }
}))

export default observer(() => {
    const store = React.useRef(botEvents).current
    const curPeriodStore = React.useRef(periodStore).current
    const classes = useStyles()

    React.useEffect(() => store.init(), [])// eslint-disable-line

    const [filter, setFilter] = React.useState('')
    let items = filter ?
        store.events.filter((item) => item.filter.includes(filter)) :
        store.events

    const handleDateChange = (newDate) => {
        store.setDate(newDate.toDate())
    }

    return (
        <div className={classes.root}>
            <Toolbar>
                <Box className={classes.title}>
                    <Typography>Bot Events Stream</Typography>
                    <Typography>Total Events: <b>{store.events.length}</b></Typography>
                </Box>
            </Toolbar>
            <Container className={classes.filter}>
                <TextField
                    className={classes.filterInput}
                    label="Filter"
                    variant="outlined"
                    value={filter}
                    onChange={(e) => setFilter(e.currentTarget.value)}
                />
                <DatePicker
                    autoOk
                    format="YYYY-M-DD"
                    disableFuture
                    variant="inline"
                    inputVariant="outlined"
                    value={curPeriodStore.date}
                    className={classes.dataPicker}
                    onChange={handleDateChange}
                />
            </Container>
            <Container>
                <LoadingPlaceholder loading={!store.initialized}>
                    <EventsTable rows={items} />
                </LoadingPlaceholder>
            </Container>
            <ReloadButton onClick={() => store.reload()} />
        </div>
    )
})