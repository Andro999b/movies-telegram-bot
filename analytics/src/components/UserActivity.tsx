import React from 'react'
import {
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  Grid,
  Button,
} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import { getEventInputProp, isSearchableEvent, getBotSearchUrl } from '../utils'
import moment from 'moment'
import { BotEvent } from '../types'

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
    backgroundColor: theme.palette.background.paper,
    paddingTop: theme.spacing(2)
  },
  propLabel: {
    display: 'inline-block',
    width: 120
  },
  prop: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  }
}))

interface Props {
  item: BotEvent
}

const UserActivity: React.FC<Props> = ({ item }) => {
  const classes = useStyles()

  const input = getEventInputProp(item)
  const title = input && input.value ?
    (<span><b>{input.name}: </b>{input.value}</span>) :
    ''

  let searchBtn = null

  if (isSearchableEvent(item)) {
    searchBtn = (
      <AccordionActions>
        <Button
          component="a"
          target="_blank"
          href={getBotSearchUrl(item)}
          variant="contained">
          Search
        </Button>
      </AccordionActions>
    )
  }

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box width={200}><Typography><b>{item.bot}#{item.type}</b></Typography></Box>
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
                  {/* @ts-ignore */}
                  <span title={item[key]}>{item[key]}</span>
                </Typography>
              </Grid>
            ))}
        </Grid>
      </AccordionDetails>
      {searchBtn}
    </Accordion>
  )
}

export default UserActivity
