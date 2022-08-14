import { observer } from 'mobx-react-lite'

import React from 'react'
import { Grid, Toolbar, Typography, makeStyles, Box } from '@material-ui/core'
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import ErrorAwareContainer from '../components/ErrorAwareContainer'
import ValuesTableVis from '../components/ValuesTableVis'
import PieChartVis from '../components/PieChartVis'
import AreaChartVis from '../components/AreaChartVis'
import BarChartVis from '../components/BarChartVis'
import DateSelector from '../components/DateSelector'
import ReloadButton from '../components/ReloadButton'
import dashboard from '../store/gaDashboard'
import periodStore from '../store/periodStore'

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '100%',
        marginBottom: theme.spacing(10),
        flexGrow: 1
    },
    title: {
        flexGrow: 1
    },
    sectionTitle: {
        textAlign: 'center'
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
    const curPeriodStore = React.useRef(periodStore).current

    React.useEffect(() => store.reload(), [])// eslint-disable-line

    return (
        <div>
            <Grid container>
                <Grid item xs={12} sm={12} md={12}>
                    <Toolbar>
                        <Box className={classes.title}>
                            <Typography>Google Analytics</Typography>
                            <Typography>Events: <b>{store.totalEvents}</b> Sessions: <b>{store.totalSessions}</b> Users: <b>{store.totalUsers}</b></Typography>
                        </Box>
                        <DateSelector value={curPeriodStore.period} onChange={(p) => store.load(p)} />
                    </Toolbar>
                </Grid>
                <ErrorAwareContainer error={store.error}>
                    <Grid container item md={7} sm={12} xs={12} className={classes.charts}>
                        <Grid container item>
                            <Grid item sm={12} xs={12} className={classes.sectionTitle}>
                                <Typography>Users</Typography>
                            </Grid>
                            <Grid item sm={9} xs={12} className={classes.item}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <AreaChartVis data={store.usersChart} lines={['users', 'new_users']} legend />
                                </LoadingPlaceholder>
                            </Grid>
                            <Grid item sm={3} xs={12} className={classes.item}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <PieChartVis data={store.countries} sequenceColors/>
                                </LoadingPlaceholder>
                            </Grid>
                        </Grid>
                        <Grid container item>
                            <Grid item sm={12} xs={12} className={classes.sectionTitle}>
                                <Typography>Sessions</Typography>
                            </Grid>
                            <Grid item sm={9} xs={12} className={classes.item}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <LoadingPlaceholder loading={store.loading}>
                                        <AreaChartVis data={store.sessionsChart} lines={['sessions']} />
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
                                    <AreaChartVis data={store.eventsChart} lines={['playlist_loaded', 'start']} legend />
                                </LoadingPlaceholder>
                            </Grid>
                            <Grid item md={6} xs={12} className={classes.item}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <AreaChartVis data={store.eventsChart} lines={['select_file']} legend />
                                </LoadingPlaceholder>
                            </Grid>
                            <Grid item md={6} xs={12} className={classes.item}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <AreaChartVis stacked data={store.eventsChart} lines={['error_playback', 'error_load']} legend />
                                </LoadingPlaceholder>
                            </Grid>
                            <Grid item md={6} xs={12} className={classes.item}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <BarChartVis data={store.eventsData} lines={store.events} legend />
                                </LoadingPlaceholder>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container md={5} item sm={12} xs={12}>
                        <Grid item sm={12} xs={12}>
                            <div className={classes.item}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <ValuesTableVis
                                        data={store.labels}
                                        title="Event Labels"
                                        showRows={35}
                                    />
                                </LoadingPlaceholder>
                            </div>
                        </Grid>
                    </Grid>
                </ErrorAwareContainer>
            </Grid>
            <ReloadButton onClick={() => store.reload(true)} />
        </div>
    )
})