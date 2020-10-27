import { observer } from 'mobx-react-lite'
import moment from 'moment'
import React from 'react'
import { makeStyles, Grid, Toolbar, Box, Typography, Container } from '@material-ui/core'
import dashboard from '../store/storageDashboard'
import ReloadButton from '../components/ReloadButton'
import ValuesTableVis from '../components/ValuesTableVis'
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import ErrorAwareContainer from '../components/ErrorAwareContainer'
import BarChartVis from '../components/BarChartVis'
import { DATE_FORMAT } from '../constants'

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
                    <Typography>Storage Analytics</Typography>
                    <Typography>Total playlist: <b>{store.total}</b></Typography>
                </Box>
            </Toolbar>
            <ErrorAwareContainer error={store.error}>
                <Container>
                    <Grid container>
                        <Grid container item xs={12} className={classes.charts}>
                            <Grid item md={6} sm={12} xs={12} className={classes.item}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <Typography>Top watched providers</Typography>
                                    <BarChartVis data={store.providersHitsChart} lines={store.providers} legend />
                                </LoadingPlaceholder>
                            </Grid>
                            <Grid item md={6} sm={12} xs={12} className={classes.item}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <Typography>Top cached providers</Typography>
                                    <BarChartVis data={store.providersChart} lines={store.providers} legend />
                                </LoadingPlaceholder>
                            </Grid>
                            <Grid item md={6} sm={12} xs={12} className={classes.table}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <ValuesTableVis
                                        data={store.top}
                                        title="Top Watched"
                                        renderName={({ result: { provider, title } }) => (
                                            <span><b className={classes.provider}>{provider}</b>{title}</span>
                                        )}
                                        renderValue={({ hit }) => hit}
                                    />
                                </LoadingPlaceholder>
                            </Grid>
                            <Grid item md={6} sm={12} xs={12} className={classes.table}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <ValuesTableVis
                                        data={store.recient}
                                        title="Recient cached"
                                        renderName={({ result: { provider, title } }) => (
                                            <span><b className={classes.provider}>{provider}</b>{title}</span>
                                        )}
                                        renderValue={({ lastModifiedDate }) =>
                                            moment(lastModifiedDate).calendar(null, {
                                                sameDay: 'HH:mm',
                                                lastDay: '[yesterday]',
                                                nextWeek: DATE_FORMAT,
                                                sameElse: DATE_FORMAT
                                            })
                                        }
                                    />
                                </LoadingPlaceholder>
                            </Grid>
                        </Grid>
                    </Grid>
                </Container>
            </ErrorAwareContainer>
            <ReloadButton onClick={() => store.reload(true)} />
        </div>
    )
})