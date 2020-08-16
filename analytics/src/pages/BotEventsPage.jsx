import React from 'react'
import {
    Toolbar,
    Typography,
    makeStyles,
    Box,
    Container,
    TextField,
} from '@material-ui/core'
import moment from 'moment'
import botEvents from '../store/botEvents'
import UserActivity from '../components/UserActivity'
import ReloadButton from '../components/ReloadButton'
import { observer } from 'mobx-react-lite'
import LoadingPlaceholder from '../components/LoadingPlaceholder'

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
        marginBottom: theme.spacing(2)
    },
    filterInput: {
        backgroundColor: '#FFF'
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
        store.events.filter((item) => item.filter.includes(filter)).slice(0, 100) :
        store.events.slice(0, 100)

    return (
        <Box className={classes.root}>
            <Toolbar>
                <Typography className={classes.title}>Bot Events Stream (Displayed: {items.length})</Typography>
                <Typography>Last Update: {moment(store.lastTs).format('HH:mm')}</Typography>
            </Toolbar>
            <Container className={classes.filter}>
                <TextField
                    className={classes.filterInput}
                    fullWidth
                    label="Filter"
                    variant="outlined"
                    value={filter}
                    onChange={(e) => setFilter(e.currentTarget.value)}
                />
            </Container>
            <Container>
                <LoadingPlaceholder loading={!store.initialized}>
                    {items.map((item) => (
                        <UserActivity key={`${item.uid}_${item.type}_${item.time}`} item={item} clickable />
                    ))}
                </LoadingPlaceholder>
            </Container>
            <ReloadButton onClick={() => store.reload()} />
        </Box>
    )
})