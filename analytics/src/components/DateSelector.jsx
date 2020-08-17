import React, { useState, Fragment } from 'react'
import { Button, Menu, MenuItem } from '@material-ui/core'
import { names, periods, DATE_FORMAT } from '../constants'
import { DatePicker } from '@material-ui/pickers'
import moment from 'moment'


export default ({ value, onChange }) => {
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

    if (!periods.includes(value)) {
        calendarDate = moment(value, DATE_FORMAT).toDate()
        name = value
    } else {
        name = names[value || periods[0]]
    }

    const handleDateChange = (newDate) => {
        setAnchorEl(null);
        onChange(moment(newDate).format(DATE_FORMAT))
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
                {periods.map((period) => (
                    <MenuItem key={period} onClick={() => handleSelect(period)}>{names[period]}</MenuItem>
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