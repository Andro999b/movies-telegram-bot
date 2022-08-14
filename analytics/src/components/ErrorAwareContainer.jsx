import React from 'react'
import {
    Typography,
    makeStyles,
    Container
} from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(2)
    },
    error: {
        color: theme.palette.error.dark,
        textAlign: 'center'
    }
}))

export default ({ error, children, Wrapper = Container }) => {
    const classes = useStyles()

    if(error) {
        return (
            <Wrapper className={classes.container}>
                <Typography className={classes.error}>{error}</Typography>
            </Wrapper>
        )
    } else {
        return children
    }

}