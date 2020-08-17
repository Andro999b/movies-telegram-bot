import React from 'react'
import { Typography, Toolbar, makeStyles, Grid, Link } from '@material-ui/core'
import DateSelector from '../components/DateSelector'
import LineChartVis from '../components/LineChartVis'
import PieChartVis from '../components/PieChartVis'
import CountTableVis from '../components/CountTableVis'
import { observer } from 'mobx-react-lite'
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import dashboard from '../store/botDashboard'
import { getUserName } from '../utils'
import ReloadButton from '../components/ReloadButton'

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
        height: 260,
        margin: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }
}))

export default observer(() => {
    const classes = useStyles()
    const store = React.useRef(dashboard).current

    React.useEffect(() => store.reload(), [])

    const totalEvent = store.botPie.reduce((acc, { value }) => acc + value, 0)

    return (
        <div className={classes.root}>
            <Grid container>
                <Grid item md={12} sm={12} xs={12}>
                    <Toolbar>
                        <Typography className={classes.title}>Bot Dashboard (Total Event: {totalEvent})</Typography>
                        <DateSelector value={store.period} onChange={(p) => store.load(p)} />
                    </Toolbar>
                </Grid>
                <Grid container item md={7} sm={12} xs={12}>
                    <Grid item sm={12} xs={12} className={classes.sectionTitle}>
                        <Typography>Users activity</Typography>
                    </Grid>
                    <Grid item sm={12} xs={12}>
                        <div className={classes.item}>
                            <LoadingPlaceholder loading={store.loading}>
                                <LineChartVis data={store.usersChart} lines={['users']} />
                            </LoadingPlaceholder>
                        </div>
                    </Grid>
                    <Grid container item>
                        <Grid item sm={12} xs={12} className={classes.sectionTitle}>
                            <Typography>Event types</Typography>
                        </Grid>
                        <Grid item sm={9} xs={12}>
                            <div className={classes.item}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <LineChartVis data={store.eventsChart} lines={store.events} />
                                </LoadingPlaceholder>
                            </div>
                        </Grid>
                        <Grid item sm={3} xs={12}>
                            <div className={classes.item}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <PieChartVis data={store.eventsPie} />
                                </LoadingPlaceholder>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid container item>
                        <Grid item sm={12} xs={12} className={classes.sectionTitle}>
                            <Typography>Event by bots</Typography>
                        </Grid>
                        <Grid item sm={9} xs={12}>
                            <div className={classes.item}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <LineChartVis data={store.botChart} lines={store.bots} />
                                </LoadingPlaceholder>
                            </div>
                        </Grid>
                        <Grid item sm={3} xs={12}>
                            <div className={classes.item}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <PieChartVis data={store.botPie} />
                                </LoadingPlaceholder>
                            </div>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container md={5} item sm={12} xs={12}>
                    <Grid item sm={12} xs={12}>
                        <div className={classes.item}>
                            <LoadingPlaceholder loading={store.loading}>
                                <CountTableVis
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
                        </div>
                    </Grid>
                </Grid>
            </Grid>
            <ReloadButton onClick={() => store.reload(true)}/>
        </div>
    )
})