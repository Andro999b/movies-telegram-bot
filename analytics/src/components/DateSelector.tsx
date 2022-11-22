import React, { useState, Fragment } from 'react'
import { Button, Popover, Box, List, ListItem, IconButton } from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import { NAMES, PERIODS, DATE_FORMAT } from '../constants'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { TextField } from '@mui/material'
import {
  ChevronLeft as ArrowBackIcon,
  ChevronRight as ArrowNextIcon
} from '@mui/icons-material'
import moment from 'moment'
import { isToday } from '../utils'

const useStyles = makeStyles((theme) => ({
  menu: {
    display: 'flex',
    flexDirection: 'column'
  },
  '@media (orientation: landscape) and (max-height: 380px)': {
    menu: {
      flexDirection: 'row-reverse'
    }
  },
  nav: {
    marginRight: theme.spacing(1)
  }
}))

interface Props {
  value: string,
  onChange: (value: string) => void
  format?: string
  periods?: string[]
}

const DateSelector: React.FC<Props> = ({ value, onChange, format = DATE_FORMAT, periods = PERIODS }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const classes = useStyles()

  const handleClose = (): void => {
    setAnchorEl(null)
  }

  const handleSelect = (value: string): void => {
    setAnchorEl(null)
    onChange(value)
  }

  let name

  //parse value for 
  let calendarDate = new Date()
  let showPrev = true, showNext = true

  if (!periods.includes(value)) {
    calendarDate = moment(value, format).toDate()
    name = value
    if (isToday(calendarDate)) {
      showNext = false
    }
  } else {
    showPrev = false
    showNext = false
    name = NAMES[value ?? periods[0]]
  }

  const handleDateChange = (newDate: Date | null): void => {
    setAnchorEl(null)
    if (newDate) {
      onChange(moment(newDate).format(format))
    }
  }

  const handleNext = (): void => {
    setAnchorEl(null)
    onChange(moment(calendarDate).add(1, 'days').format(format))
  }

  const handlePrev = (): void => {
    setAnchorEl(null)
    onChange(moment(calendarDate).add(-1, 'days').format(format))
  }

  return (
    <Fragment>
      {showPrev &&
        <IconButton className={classes.nav} onClick={handlePrev} size="large">
          <ArrowBackIcon />
        </IconButton>}
      {showNext &&
        <IconButton className={classes.nav} onClick={handleNext} size="large">
          <ArrowNextIcon />
        </IconButton>}
      <Button variant="contained" onClick={(e): void => setAnchorEl(e.currentTarget)}>
        {name}
      </Button>
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Box className={classes.menu}>
          <List>
            {PERIODS.map((period) => (
              <ListItem key={period} button onClick={(): void => handleSelect(period)}>{NAMES[period]}</ListItem>
            ))}
          </List>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <StaticDatePicker
              displayStaticWrapperAs="desktop"
              disableFuture
              openTo="day"
              value={calendarDate}
              onChange={handleDateChange}
              renderInput={(params): JSX.Element => <TextField {...params} />}
            />
          </LocalizationProvider>
        </Box>
      </Popover>
    </Fragment>
  )
}
export default DateSelector
