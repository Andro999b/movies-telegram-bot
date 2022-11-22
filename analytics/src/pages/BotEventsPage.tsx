import React from 'react'
import { Toolbar, Typography, Box, Container, TextField } from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import botEvents from '../store/botEvents'
import EventsTable from '../components/EventsTable'
import ReloadButton from '../components/ReloadButton'
import { observer } from 'mobx-react-lite'
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import ErrorAwareContainer from '../components/ErrorAwareContainer'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import periodStore from '../store/periodStore'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100%',
    marginBottom: theme.spacing(10),
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
    backgroundColor: theme.palette.background.default,
    marginRight: theme.spacing(2)
  },
  dataPicker: {
    backgroundColor: theme.palette.background.default,
    width: 150
  }
}))

const BotEventsPage: React.FC = () => {
  const classes = useStyles()

  React.useEffect(() => botEvents.init(), []) // eslint-disable-line

  const [filter, setFilter] = React.useState('')
  const items = filter ?
    botEvents.events.filter((item) => item.filter.includes(filter)) :
    botEvents.events

  const handleDateChange = (newDate: unknown): void => {
    botEvents.setDate(newDate as Date)
  }

  return (
    <div className={classes.root}>
      <Toolbar>
        <Box className={classes.title}>
          <Typography>Bot Events Stream</Typography>
          <Typography>Total Events: <b>{botEvents.events.length}</b></Typography>
        </Box>
      </Toolbar>
      <ErrorAwareContainer error={botEvents.error}>
        <>
          <Container className={classes.filter}>
            <TextField
              className={classes.filterInput}
              label="Filter"
              variant="outlined"
              value={filter}
              onChange={(e): void => setFilter(e.currentTarget.value)} />
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                disableFuture
                value={periodStore.date}
                className={classes.dataPicker}
                onChange={handleDateChange}
                renderInput={(params): JSX.Element => <TextField {...params} variant="outlined" disabled />}
              />
            </LocalizationProvider>
          </Container>
          <Container>
            <LoadingPlaceholder loading={!botEvents.initialized}>
              <EventsTable rows={items} />
            </LoadingPlaceholder>
          </Container>
        </>
      </ErrorAwareContainer>
      <ReloadButton onClick={(): void => botEvents.reload()} />
    </div>
  )
}

export default observer(BotEventsPage)
