import React from 'react'
import {
    Toolbar,
    Typography,
    makeStyles,
    Box,
    Container,
    TextField
} from '@material-ui/core'
import moment from 'moment'
import botEvents from '../store/botEvents'
import EventsTable from '../components/EventsTable'
import ReloadButton from '../components/ReloadButton'
import { observer } from 'mobx-react-lite'
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import { DatePicker } from '@material-ui/pickers'

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
        width: 100
    }
}))

export default observer(() => {
    const store = React.useRef(botEvents).current
    const classes = useStyles()

    React.useEffect(() => {
        if (!store.lastTs) store.reload()

        store.startUpdate()

        return () => store.stopUpdate()
    }, [])

    const [filter, setFilter] = React.useState('')
    let items = filter ?
        store.events.filter((item) => item.filter.includes(filter)) :
        store.events

    const handleDateChange = (newDate) => {
        store.setDate(newDate.toDate())
    }

    return (
        <Box className={classes.root}>
            <Toolbar>
                <Typography className={classes.title}>Bot Events Stream</Typography>
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
                    format="YYYY-M-D"
                    disableFuture
                    inputVariant="outlined"
                    value={store.date}
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
        </Box>
    )
})