import React from 'react'
import {
    Typography,
    makeStyles,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Link,
    Grid
} from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { getUserName } from '../utils'
import moment from 'moment'

const filterProperties = [
    'time', 'uid',
    'username', 'firstname', 'lastname',
    'date', 'month', 'type',
    'ttl', 'filter'
]

const useStyles = makeStyles((theme) => ({
    details: {
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        backgroundColor: grey[100],
        paddingTop: theme.spacing(2)
    },
    propLabel: {
        display: 'inline-block',
        width: 110
    },
    prop: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
    }
}))

export default ({ item, clickable }) => {
    const classes = useStyles()

    const title = clickable ?
        <Link href={`#/users/${item.uid}`}>{getUserName(item)}</Link> :
        getUserName(item)


    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box width={120}><Typography><b>{item.type}</b></Typography></Box>
                <Box flexGrow={1}>
                    <Typography>{title}</Typography>
                </Box>
                <Typography>{moment(item.time).format('YYYY-M-D HH:mm')}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
                <Grid container>
                    {Object
                        .keys(item)
                        .filter((key) => !filterProperties.includes(key))
                        .map((key) => (
                            <Grid item sm={12} md={6} key={key}>
                                <Typography className={classes.prop}>
                                    <span className={classes.propLabel}><b>{key}:</b></span>
                                    <span title={item[key]}>{item[key]}</span>
                                </Typography>
                            </Grid>
                        ))
                    }
                </Grid>
            </AccordionDetails>
        </Accordion>
    )
}