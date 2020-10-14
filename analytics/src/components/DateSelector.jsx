import React, { useState, Fragment } from 'react'
import {
    Button,
    Popover,
    Box,
    List,
    ListItem,
    IconButton,
    makeStyles
} from '@material-ui/core'
import { NAMES, PERIODS, DATE_FORMAT } from '../constants'
import { DatePicker } from '@material-ui/pickers'
import {
    ChevronLeft as ArrowBackIcon,
    ChevronRight as ArrowNextIcon
} from '@material-ui/icons'
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

export default ({ value, onChange, format = DATE_FORMAT, periods = PERIODS }) => {
    const [anchorEl, setAnchorEl] = useState(null)
    const classes = useStyles()

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleSelect = (value) => {
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
        if(isToday(calendarDate)) {
            showNext = false
        }
    } else {
        showPrev = false
        showNext = false
        name = NAMES[value || periods[0]]
    }

    const handleDateChange = (newDate) => {
        setAnchorEl(null)
        onChange(moment(newDate).format(format))
    }

    const handleNext = () => {
        setAnchorEl(null)
        onChange(moment(calendarDate).add(1, 'days').format(format))
    }

    const handlePrev = () => {
        setAnchorEl(null)
        onChange(moment(calendarDate).add(-1, 'days').format(format))
    }

    return (
        <Fragment>
            {showPrev &&
                <IconButton className={classes.nav} onClick={handlePrev}>
                    <ArrowBackIcon />
                </IconButton>
            }
            {showNext &&
                <IconButton className={classes.nav} onClick={handleNext}>
                    <ArrowNextIcon />
                </IconButton>
            }
            <Button
                variant="contained"
                color="default"
                onClick={(e) => setAnchorEl(e.currentTarget)}
            >
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
                            <ListItem key={period} button onClick={() => handleSelect(period)}>{NAMES[period]}</ListItem>
                        ))}
                    </List>
                    <DatePicker
                        disableFuture
                        variant="static"
                        openTo="date"
                        value={calendarDate}
                        onChange={handleDateChange}
                    />
                </Box>
            </Popover>
        </Fragment>
    )
}