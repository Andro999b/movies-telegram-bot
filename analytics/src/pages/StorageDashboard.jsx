import { observer } from 'mobx-react-lite'
import moment from 'moment'
import React from 'react'
import { Grid, Toolbar, Box, Typography, Container, Button, Link } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import dashboard from '../store/storageDashboard'
import ReloadButton from '../components/ReloadButton'
import InvalidateDialog from '../components/InvalidateDialog'
import ValuesTableVis from '../components/ValuesTableVis'
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import ErrorAwareContainer from '../components/ErrorAwareContainer'
import BarChartVis from '../components/BarChartVis.tsx'
import { DATE_FORMAT } from '../constants'
import { getWatchUrl } from '../utils'

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '100%',
        marginBottom: theme.spacing(10),
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

const dbIdWatchUrl = (dbId) => {
    const [provider, id] = dbId.split(':')
    return getWatchUrl(provider, id)
}

export default observer(() => {
    const classes = useStyles()

    const store = React.useRef(dashboard).current
    React.useEffect(() => store.reload(), [])// eslint-disable-line

    const [invalidateDialog, showInvalidateDialog] = React.useState(false)

    const renderResultName = ({ _id, result: { provider, title } }) => (
        <span>
            <b className={classes.provider}>{provider}</b>
            <Link href={dbIdWatchUrl(_id)} target='_blank'>{title}</Link>
        </span>
    )

    return (
        <div className={classes.root}>
            <Toolbar>
                <Box className={classes.title}>
                    <Typography>Storage Analytics</Typography>
                    <Typography>Total playlist: <b>{store.total}</b></Typography>
                </Box>
                <Button
                    variant="contained"
                    onClick={() => showInvalidateDialog(!invalidateDialog)}>
                    Invalidate
                </Button>
            </Toolbar>
            <ErrorAwareContainer error={store.error}>
                <Container>
                    <Grid container>
                        <Grid container item xs={12} className={classes.charts}>
                            <Grid item md={6} sm={12} xs={12} className={classes.item}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <Typography>Top watched providers</Typography>
                                    <BarChartVis data={store.providersHitsChart} legend />
                                </LoadingPlaceholder>
                            </Grid>
                            <Grid item md={6} sm={12} xs={12} className={classes.item}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <Typography>Top cached providers</Typography>
                                    <BarChartVis data={store.providersChart} legend />
                                </LoadingPlaceholder>
                            </Grid>
                            <Grid item md={6} sm={12} xs={12} className={classes.table}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <ValuesTableVis
                                        data={store.top}
                                        title="Top Watched"
                                        renderName={renderResultName}
                                        renderValue={({ hit }) => hit}
                                    />
                                </LoadingPlaceholder>
                            </Grid>
                            <Grid item md={6} sm={12} xs={12} className={classes.table}>
                                <LoadingPlaceholder loading={store.loading}>
                                    <ValuesTableVis
                                        data={store.recient}
                                        title="Recient cached"
                                        renderName={renderResultName}
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
            <InvalidateDialog
                providers={store.providers}
                open={invalidateDialog}
                onInvalidate={({ provider, resultId }) => store.invalidate(provider, resultId)}
                onClose={() => showInvalidateDialog(false)}
            />
        </div>
    );
})
