import React, { useState, Fragment } from 'react'
import { Button, Menu, MenuItem } from '@material-ui/core'
import { names, periods } from '../constants'


export default ({ value, onChange }) => {
    const [anchorEl, setAnchorEl] = useState(null)

    const handleClose = () => {
        setAnchorEl(null);
    }

    const handleSelect = (value) => {
        setAnchorEl(null);
        onChange(value)
    }

    const name = names[value || periods[0]]

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
            </Menu>
        </Fragment>
    )
}