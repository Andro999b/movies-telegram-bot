import React from 'react'
import {
    Typography,
    makeStyles,
    Container
} from '@material-ui/core'
import { red } from '@material-ui/core/colors'

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(2)
    },
    error: {
        color: red[900],
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