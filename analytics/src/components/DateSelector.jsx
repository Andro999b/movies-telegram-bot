import React, { useState, Fragment } from 'react'
import { Button, Menu, MenuItem } from '@material-ui/core'
import { NAMES, PERIODS, DATE_FORMAT } from '../constants'
import { DatePicker } from '@material-ui/pickers'
import moment from 'moment'


export default ({ value, onChange, format = DATE_FORMAT }) => {
    const [anchorEl, setAnchorEl] = useState(null)

    const handleClose = () => {
        setAnchorEl(null);
    }

    const handleSelect = (value) => {
        setAnchorEl(null);
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
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {PERIODS.map((period) => (
                    <MenuItem key={period} onClick={() => handleSelect(period)}>{NAMES[period]}</MenuItem>
                ))}
                <DatePicker
                    disableFuture
                    variant="static"
                    openTo="date"
                    value={calendarDate}
                    onChange={handleDateChange}
                />
            </Menu>
        </Fragment>
    )
}