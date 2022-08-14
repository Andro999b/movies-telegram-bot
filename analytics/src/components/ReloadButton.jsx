import React from 'react'
import { Refresh as RefreshIcon } from '@material-ui/icons'
import { Fab, withStyles } from '@material-ui/core'

const styles = {
    fab: {
        position: 'fixed',
        bottom: 50,
        right: 10,
    }
}

export default withStyles(styles)(({ onClick, classes }) => (
    <Fab color="primary" className={classes.fab} onClick={onClick}>
        <RefreshIcon />
    </Fab>
))