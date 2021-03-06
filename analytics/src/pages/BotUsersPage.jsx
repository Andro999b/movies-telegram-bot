import React from 'react'
import { observer, useLocalStore } from 'mobx-react-lite'
import { Container, Toolbar, Typography, Grid, makeStyles } from '@material-ui/core'
import botUser from '../store/botUser'
import { useParams } from 'react-router-dom'
import UserActivity from '../components/UserActivity'
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import ErrorAwareContainer from '../components/ErrorAwareContainer'
import PieChartVis from '../components/PieChartVis'
import ReloadButton from '../components/ReloadButton'
import { Store } from '@material-ui/icons'

const useStyles = makeStyles((theme) => ({
    sectionTitle: {
        textAlign: 'center'
    },
    chart: {
        height: 260,
        margin: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }
}))

export default observer(() => {
    const classes = useStyles()
    const user = useLocalStore(botUser)
    const { uid } = useParams()

    React.useEffect(() => user.load(uid), [])// eslint-disable-line

    const items = user.events.slice(0, 100)

    return (
        <div>
            <Toolbar>
                <Typography>{user.name} (Events: <b>{user.events.length}</b>)</Typography>
            </Toolbar>
            <ErrorAwareContainer error={Store.error}>
                <Container>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={6}>
                            <div className={classes.sectionTitle}>
                                <Typography>Bots</Typography>
                            </div>
                            <div className={classes.chart}>
                                <LoadingPlaceholder loading={user.loading}>
                                    <PieChartVis data={user.botsPie} />
                                </LoadingPlaceholder>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <div className={classes.sectionTitle}>
                                <Typography>Event types</Typography>
                            </div>
                            <div className={classes.chart}>
                                <LoadingPlaceholder loading={user.loading}>
                                    <PieChartVis data={user.eventsPie} />
                                </LoadingPlaceholder>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <LoadingPlaceholder loading={user.loading}>
                                {items.map((item) => (
                                    <UserActivity key={`${item.uid}_${item.type}_${item.time}`} item={item} />
                                ))}
                            </LoadingPlaceholder>
                        </Grid>
                    </Grid>
                </Container>
            </ErrorAwareContainer>
            <ReloadButton onClick={() => user.load(uid)} />
        </div>
    )
})