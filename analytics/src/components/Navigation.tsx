import React from 'react'
import clsx from 'clsx'
import {
  Drawer,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import {
  ChevronLeft as LeftIcon,
  ChevronRight as RightIcon,
  Dashboard as DashboardIcon,
  ViewStream as EventsIcon,
  Web as WedIcon,
  Storage as StorageIcon,
  Error as ErrorIcon
} from '@mui/icons-material'
import { useHistory } from 'react-router-dom'

const drawerWidth = 240

const useStyle = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(8)
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  }
}))

const Navigation: React.FC = () => {
  const [open, setOpen] = React.useState(false)
  const history = useHistory()
  const classes = useStyle()

  return (
    <Drawer
      variant="permanent"
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open,
      })}
      classes={{
        paper: clsx({
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        }),
      }}
    >
      <div className={classes.toolbar}>
        <IconButton onClick={(): void => setOpen(!open)} size="large">
          {open ? <LeftIcon /> : <RightIcon />}
        </IconButton>
      </div>
      <Divider />
      <List>
        <ListItem button onClick={(): void => history.push('/')}>
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Bot Dashboard" />
        </ListItem>
        <ListItem button onClick={(): void => history.push('/events')}>
          <ListItemIcon><EventsIcon /></ListItemIcon>
          <ListItemText primary="Bot Events" />
        </ListItem>
        <ListItem button onClick={(): void => history.push('/ga')}>
          <ListItemIcon><WedIcon /></ListItemIcon>
          <ListItemText primary="Google Analytics" />
        </ListItem>
        <ListItem button onClick={(): void => history.push('/storage')}>
          <ListItemIcon><StorageIcon /></ListItemIcon>
          <ListItemText primary="Storage" />
        </ListItem>
        <ListItem button onClick={(): void => history.push('/errors')}>
          <ListItemIcon><ErrorIcon /></ListItemIcon>
          <ListItemText primary="Errors log" />
        </ListItem>
      </List>
    </Drawer>
  )
}
export default Navigation
