import React from 'react'
import { Typography, Toolbar, makeStyles, Grid, Link, Box } from '@material-ui/core'
import DateSelector from '../components/DateSelector'
import PieChartVis from '../components/PieChartVis'
import ValuesTableVis from '../components/ValuesTableVis'
import { observer } from 'mobx-react-lite'
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import ErrorAwareContainer from '../components/ErrorAwareContainer'
import dashboard from '../store/botDashboard'
import periodStore from '../store/periodStore'
import { getUserName } from '../utils'
import ReloadButton from '../components/ReloadButton'
import AreaChartVis from '../components/AreaChartVis'

const useStyles = makeStyles((theme) => ({
    root: {
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

    React.useEffect(() => store.reload(), []) // eslint-disable-line

    const totalEvent = store.botPie.reduce((acc, { value }) => acc + value, 0)

    return (
        <div className={classes.root}>
            <Grid container>
                <Grid item md={12} sm={12} xs={12}>
                    <Toolbar>
                        <Box className={classes.title}>
                            <Typography>Bot Dashboard</Typography>
                            <Typography>Event: <b>{totalEvent}</b> Users: <b>{store.topUsers.length}</b></Typography>
                        </Box>
                        <DateSelector value={curPeriodStore.period} onChange={(p) => store.load(p)} />
                    </Toolbar>
                </Grid>
                <ErrorAwareContainer error={store.error}>
                    <Grid container item md={7} sm={12} xs={12} className={classes.charts}>
                        <Grid item sm={12} xs={12} className={classes.sectionTitle}>
                            <Typography>Users activity</Typography>
                        </Grid>
                        <Grid item sm={12} xs={12} className={classes.item}>
                            <LoadingPlaceholder loading={store.loading}>
                                <AreaChartVis data={store.usersChart} lines={['count']} />
                            </LoadingPlaceholder>
                        </Grid>
                        <Grid container item>
                            <Grid item sm={12} xs={12} className={classes.sectionTitle}>
                                <Typography>Event types</Typography>
                            </Grid>
                            <Grid item sm={9} xs={12} className={classes.item}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <AreaChartVis stacked data={store.eventsChart} lines={store.events} />
                                </LoadingPlaceholder>
                            </Grid>
                            <Grid item sm={3} xs={12} className={classes.item}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <PieChartVis data={store.eventsPie} />
                                </LoadingPlaceholder>
                            </Grid>
                        </Grid>
                        <Grid container item>
                            <Grid item sm={12} xs={12} className={classes.sectionTitle}>
                                <Typography>Event by bots</Typography>
                            </Grid>
                            <Grid item sm={9} xs={12} className={classes.item}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <AreaChartVis stacked data={store.botChart} lines={store.bots} />
                                </LoadingPlaceholder>
                            </Grid>
                            <Grid item sm={3} xs={12} className={classes.item}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <PieChartVis data={store.botPie} />
                                </LoadingPlaceholder>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container md={5} item sm={12} xs={12}>
                        <Grid item sm={12} xs={12} className={classes.table}>
                            <LoadingPlaceholder loading={store.loading}>
                                <ValuesTableVis
                                    data={store.topUsers}
                                    showTotal
                                    title="Top Users"
                                    renderName={({ item }) =>
                                        <Link href={`#/users/${item.uid}`}>
                                            {getUserName(item)}
                                        </Link>
                                    }
                                />
                            </LoadingPlaceholder>
                        </Grid>
                    </Grid>
                </ErrorAwareContainer>
            </Grid>
            <ReloadButton onClick={() => store.reload(true)} />
        </div>
    )
})