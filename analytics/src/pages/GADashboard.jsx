import { observer } from "mobx-react-lite";

import React from 'react'
import { Grid, Toolbar, Typography } from "@material-ui/core";
import dashboard from '../store/gaDashboard'

export default observer(() => {
    const store = React.useRef(dashboard).current

    React.useEffect(() => store.reload(), [])

    return (
        <div>
            <Grid container>
                <Grid item xs={12} sm={12} md={12}>
                    <Toolbar>
                        <Typography>Google Analytics</Typography>
                    </Toolbar>
                </Grid>
            </Grid>
        </div>
    )
})