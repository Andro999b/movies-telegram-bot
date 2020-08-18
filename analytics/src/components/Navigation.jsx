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
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import {
    ChevronLeft as LeftIcon,
    ChevronRight as RightIcon,
    Dashboard as DashboardIcon,
    ViewStream as EventsIcon,
    Web as WedIcon,
    Storage as StorageIcon
} from '@material-ui/icons'
import { useHistory } from "react-router-dom";

const drawerWidth = 240;

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

export default () => {
    const [open, setOpen] = React.useState(false);
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
                <IconButton onClick={() => setOpen(!open)}>
                    {open ? <LeftIcon /> : <RightIcon />}
                </IconButton>
            </div>
            <Divider />
            <List>
                <ListItem button onClick={() => history.push('/')}>
                    <ListItemIcon><DashboardIcon /></ListItemIcon>
                    <ListItemText primary="Bot Dashboard" />
                </ListItem>
                <ListItem button onClick={() => history.push('/events')}>
                    <ListItemIcon><EventsIcon /></ListItemIcon>
                    <ListItemText primary="Bot Events" />
                </ListItem>
                <ListItem button onClick={() => history.push('/ga')}>
                    <ListItemIcon><WedIcon /></ListItemIcon>
                    <ListItemText primary="Google Analytics" />
                </ListItem>                
                <ListItem button onClick={() => history.push('/storage')}>
                    <ListItemIcon><StorageIcon /></ListItemIcon>
                    <ListItemText primary="Storage" />
                </ListItem>
            </List>
        </Drawer>
    )
}