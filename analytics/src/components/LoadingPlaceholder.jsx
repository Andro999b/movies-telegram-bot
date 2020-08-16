import React from 'react'
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core';

const useStyle = makeStyles(() => ({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
    }
}))

export default ({ children, loading }) => {
    const classes = useStyle()

    if(loading) {
        return (
            <div className={classes.container}>
                <CircularProgress disableShrink/>
            </div>
        )
    }

    return children
}