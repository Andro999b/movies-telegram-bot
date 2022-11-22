import React from 'react'
import { Typography, Toolbar, Grid, Link, Box } from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
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
    minHeight: '100%',
    flexGrow: 1,
    marginBottom: theme.spacing(10)
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

const BotDashboardPage: React.FC = () => {
  const classes = useStyles()
  const curPeriodStore = React.useRef(periodStore).current

  React.useEffect(() => dashboard.reload(false), []) // eslint-disable-line

  const totalEvent = dashboard.botPie.reduce((acc, { value }) => acc + value, 0)

  return (
    <div className={classes.root}>
      <Grid container>
        <Grid item md={12} sm={12} xs={12}>
          <Toolbar>
            <Box className={classes.title}>
              <Typography>Bot Dashboard</Typography>
              <Typography>Event: <b>{totalEvent}</b> Users: <b>{dashboard.topUsers.length}</b></Typography>
            </Box>
            <DateSelector value={curPeriodStore.period} onChange={(p: string): void => dashboard.load(p)} />
          </Toolbar>
        </Grid>
        <ErrorAwareContainer error={dashboard.error}>
          <>
            <Grid container item md={8} sm={12} xs={12} className={classes.charts}>
              <Grid container item>
                <Grid item sm={9} xs={12} className={classes.item}>
                  <Typography>Users activity</Typography>
                  <LoadingPlaceholder loading={dashboard.loading}>
                    <AreaChartVis data={dashboard.usersChart} lines={['count']} />
                  </LoadingPlaceholder>
                </Grid>
                <Grid item sm={3} xs={12} className={classes.item}>
                  <Typography>Language</Typography>
                  <LoadingPlaceholder loading={dashboard.loading}>
                    <PieChartVis data={dashboard.languagePie} sequenceColors />
                  </LoadingPlaceholder>
                </Grid>
              </Grid>
              <Grid container item>
                <Grid item sm={12} xs={12} className={classes.sectionTitle}>
                  <Typography>Event types</Typography>
                </Grid>
                <Grid item sm={9} xs={12} className={classes.item}>
                  <LoadingPlaceholder loading={dashboard.loading}>
                    <AreaChartVis stacked data={dashboard.eventsChart} lines={dashboard.events} />
                  </LoadingPlaceholder>
                </Grid>
                <Grid item sm={3} xs={12} className={classes.item}>
                  <LoadingPlaceholder loading={dashboard.loading}>
                    <PieChartVis data={dashboard.eventsPie} />
                  </LoadingPlaceholder>
                </Grid>
              </Grid>
              <Grid container item>
                <Grid item sm={12} xs={12} className={classes.sectionTitle}>
                  <Typography>Event by bots</Typography>
                </Grid>
                <Grid item sm={9} xs={12} className={classes.item}>
                  <LoadingPlaceholder loading={dashboard.loading}>
                    <AreaChartVis stacked data={dashboard.botChart} lines={dashboard.bots} />
                  </LoadingPlaceholder>
                </Grid>
                <Grid item sm={3} xs={12} className={classes.item}>
                  <LoadingPlaceholder loading={dashboard.loading}>
                    <PieChartVis data={dashboard.botPie} />
                  </LoadingPlaceholder>
                </Grid>
              </Grid>
            </Grid>
            <Grid container md={4} item sm={12} xs={12}>
              <Grid item sm={12} xs={12} className={classes.table}>
                <LoadingPlaceholder loading={dashboard.loading}>
                  <ValuesTableVis
                    data={dashboard.topUsers}
                    showTotal
                    title="Top Users"
                    renderName={({ item }): JSX.Element => <Link href={`#/users/${item.uid}`}>
                      {getUserName(item)}
                    </Link>} />
                </LoadingPlaceholder>
              </Grid>
            </Grid>
          </>
        </ErrorAwareContainer>
      </Grid>
      <ReloadButton onClick={(): void => dashboard.reload(true)} />
    </div>
  )
}
export default observer(BotDashboardPage)
