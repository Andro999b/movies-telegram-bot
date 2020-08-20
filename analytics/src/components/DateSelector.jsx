import React, { useState, Fragment } from 'react'
import { Button, Popover, Box, List, ListItem, makeStyles } from '@material-ui/core'
import { NAMES, PERIODS, DATE_FORMAT } from '../constants'
import { DatePicker } from '@material-ui/pickers'
import moment from 'moment'

const useStyles = makeStyles(() => ({
    menu: {
        display: 'flex',
        flexDirection: 'column'
    },
    '@media (orientation: landscape) and (max-height: 380px)': {
        menu: {
            flexDirection: 'row-reverse'
        }
    }
}))

export default ({ value, onChange, format = DATE_FORMAT }) => {
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

    if (!PERIODS.includes(value)) {
        calendarDate = moment(value, format).toDate()
        name = value
    } else {
        name = NAMES[value || PERIODS[0]]
    }

    const handleDateChange = (newDate) => {
        setAnchorEl(null);
        onChange(moment(newDate).format(format))
    }

    return (
        <Fragment>
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