import { observer } from 'mobx-react-lite'
import React from 'react'
import { makeStyles, Grid, Toolbar, Box, Typography, Container, Button } from '@material-ui/core'
import dashboard from '../store/watchesDashboard'
import ReloadButton from '../components/ReloadButton'
import ValuesTableVis from '../components/ValuesTableVis'
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import ErrorAwareContainer from '../components/ErrorAwareContainer'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1
    },
    title: {
        flexGrow: 1
    },
    item: {
        height: 300,
        textAlign: 'center',
        padding: theme.spacing(2)
    },
    table: {
        padding: theme.spacing(1),
        textAlign: 'center',
    },
    charts: {
        justifyContent: 'start',
        alignContent: 'flex-start'
    },
    provider: {
        display: 'inline-block',
        width: 80
    }
}))


export default observer(() => {
    const classes = useStyles()

    const store = React.useRef(dashboard).current
    React.useEffect(() => store.reload(), [])// eslint-disable-line

    return (
        <div>
            <Toolbar>
                <Box className={classes.title}>
                    <Typography>Top Watches</Typography>
                </Box>
            </Toolbar>
            <ErrorAwareContainer error={store.error}>
                <Container>
                    <Grid container>
                        <Grid item md={6} sm={12} xs={12} className={classes.item}>
                            <LoadingPlaceholder loading={store.loading}>
                                <Typography>Top watched films</Typography>
                            </LoadingPlaceholder>
                        </Grid>
                        <Grid item md={6} sm={12} xs={12} className={classes.item}>
                            <LoadingPlaceholder loading={store.loading}>
                                <Typography>Top watched anime</Typography>
                            </LoadingPlaceholder>
                        </Grid>
                    </Grid>
                </Container>
            </ErrorAwareContainer>
            <ReloadButton onClick={() => store.reload(true)} />
        </div >
    )
})