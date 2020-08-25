import { observer } from 'mobx-react-lite'

import React from 'react'
import { makeStyles, Grid, Toolbar, Box, Typography, Container } from '@material-ui/core'
import dashboard from '../store/storageDashboard'
import ReloadButton from '../components/ReloadButton'
import CountTableVis from '../components/CountTableVis'
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import BarChartVis from '../components/BarChartVis'

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
        padding: theme.spacing(2),
        textAlign: 'center',
    },
    charts: {
        justifyContent: 'start',
        alignContent: 'flex-start'
    }
}))


export default observer(() => {
    const classes = useStyles()

    const store = React.useRef(dashboard).current
    React.useEffect(() => store.reload(), [])// eslint-disable-line

    return (
        <div>
            <Container>
                <Grid container>
                    <Grid item xs={12}>
                        <Toolbar>
                            <Box className={classes.title}>
                                <Typography>Storage Analytics</Typography>
                                <Typography>Total playlist: {store.total}</Typography>
                            </Box>
                        </Toolbar>
                    </Grid>
                    <Grid container item xs={12} className={classes.charts}>
                        <Grid item sm={12} xs={12} className={classes.item}>
                            <LoadingPlaceholder loading={store.loading}>
                                <BarChartVis data={store.providersChart} lines={store.providers} legend />
                            </LoadingPlaceholder>
                        </Grid>
                        <Grid item sm={12} xs={12} className={classes.item}>
                            <LoadingPlaceholder loading={store.loading}>
                                <CountTableVis
                                    data={store.top}
                                    title="Top Watched"
                                />
                            </LoadingPlaceholder>
                        </Grid>
                    </Grid>
                </Grid>

                <ReloadButton onClick={() => store.reload(true)} />
            </Container>
        </div>
    )
})