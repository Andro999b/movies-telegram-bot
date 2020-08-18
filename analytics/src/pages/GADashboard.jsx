import { observer } from "mobx-react-lite"

import React from 'react'
import { Grid, Toolbar, Typography, makeStyles, Box } from "@material-ui/core"
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import CountTableVis from '../components/CountTableVis'
import PieChartVis from '../components/PieChartVis'
import LineChartVis from '../components/LineChartVis'
import DateSelector from '../components/DateSelector'
import ReloadButton from '../components/ReloadButton'
import dashboard from '../store/gaDashboard'
import { GA_DATE_FORMAT } from "../constants"

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1
    },
    title: {
        flexGrow: 1
    },
    sectionTitle: {
        textAlign: "center"
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

    React.useEffect(() => store.reload(), [])

    return (
        <div>
            <Grid container>
                <Grid item xs={12} sm={12} md={12}>
                    <Toolbar>
                        <Box className={classes.title}>
                            <Typography>Google Analytics</Typography>
                            <Typography>Events: {store.totalEvents} Sessions: {store.totalSessions}</Typography>
                        </Box>
                        <DateSelector value={store.period} format={GA_DATE_FORMAT} onChange={(p) => store.load(p)} />
                    </Toolbar>
                </Grid>
                <Grid container item md={7} sm={12} xs={12} className={classes.charts}>
                    <Grid item sm={12} xs={12} className={classes.sectionTitle}>
                        <Typography>Users</Typography>
                    </Grid>
                    <Grid item sm={12} xs={12} className={classes.item}>
                        <LoadingPlaceholder loading={store.loading}>
                            <LineChartVis data={store.usersChart} lines={['users', 'newUsers']} legend />
                        </LoadingPlaceholder>
                    </Grid>
                    <Grid container item>
                        <Grid item sm={12} xs={12} className={classes.sectionTitle}>
                            <Typography>Sessions</Typography>
                        </Grid>
                        <Grid item sm={9} xs={12} className={classes.item}>
                            <LoadingPlaceholder loading={store.loading}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <LineChartVis data={store.sessionsChart} lines={['sessions']} />
                                </LoadingPlaceholder>
                            </LoadingPlaceholder>
                        </Grid>
                        <Grid item sm={3} xs={12} className={classes.item}>
                            <LoadingPlaceholder loading={store.loading}>
                                <PieChartVis data={store.devicePie} />
                            </LoadingPlaceholder>
                        </Grid>
                    </Grid>
                    <Grid container item>
                        <Grid item md={12} xs={12} className={classes.sectionTitle}>
                            <Typography>Events</Typography>
                        </Grid>
                        <Grid item md={6} xs={12} className={classes.item}>
                            <LoadingPlaceholder loading={store.loading}>
                                <LineChartVis data={store.eventsChart} lines={['playlistLoaded', 'start']} legend />
                            </LoadingPlaceholder>
                        </Grid>
                        <Grid item md={6} xs={12} className={classes.item}>
                            <LoadingPlaceholder loading={store.loading}>
                                <LineChartVis data={store.eventsChart} lines={['selectFile']} legend />
                            </LoadingPlaceholder>
                        </Grid>
                        <Grid item md={6} xs={12} className={classes.item}>
                            <LoadingPlaceholder loading={store.loading}>
                                <LineChartVis data={store.eventsChart} lines={['errorPlayback', 'errorLoad']} legend />
                            </LoadingPlaceholder>
                        </Grid>
                        <Grid item md={6} xs={12} className={classes.item}>
                            <LoadingPlaceholder loading={store.loading}>
                                <PieChartVis data={store.eventsPie} />
                            </LoadingPlaceholder>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container md={5} item sm={12} xs={12}>
                    <Grid item sm={12} xs={12}>
                        <div className={classes.item}>
                            <LoadingPlaceholder loading={store.loading}>
                                <CountTableVis
                                    data={store.labels}
                                    title="Event Labels"
                                    showRows={35}
                                />
                            </LoadingPlaceholder>
                        </div>
                    </Grid>
                </Grid>
            </Grid>
            <ReloadButton onClick={() => store.reload(true)} />
        </div>
    )
})