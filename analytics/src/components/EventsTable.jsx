import React from 'react'
import {
    TableContainer,
    TableCell,
    TableRow,
    TableBody,
    TableHead,
    TablePagination,
    Typography,
    Paper,
    Link,
    Collapse,
    Grid,
    IconButton,
    makeStyles,
    Table,
    Button,
    Box
} from '@material-ui/core'
import {
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon
} from '@material-ui/icons'
import moment from 'moment'
import {
    getUserName,
    getEventInputProp,
    isSearchableEvent,
    getBotSearchUrl
} from '../utils'
import { grey } from '@material-ui/core/colors'

const filterProperties = [
    'time', 'uid',
    'username', 'firstname', 'lastname',
    'date', 'month', 'type',
    'ttl', 'filter'
]

const rowsPerPageOptions = [25, 50, 100]

const useRowStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            borderBottom: 'unset',
        },
    },
    contentCell: {
        paddingTop: 0,
        paddingBottom: 0,
        backgroundColor: theme.palette.background
    },
    propLabel: {
        display: 'inline-block',
        width: 110
    },
    prop: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
    },
    details: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2)
    },
    searchBtn: {
        display: 'flex',
        paddingBottom: theme.spacing(2),
        justifyContent: 'flex-end'
    }
}))

const Row = ({ data }) => {
    const classes = useRowStyles()
    const [open, setOpen] = React.useState(false)

    const input = getEventInputProp(data)
    let searchBtn = null

    if (isSearchableEvent(data)) {
        searchBtn = (
            <Box className={classes.searchBtn}>
                <Button
                    component="a"
                    target="_blank"
                    href={getBotSearchUrl(data)}
                    variant="contained">
                    Search
                </Button>
            </Box>
        )
    }

    return (
        <React.Fragment>
            <TableRow className={classes.root}>
                <TableCell width={110}>
                    <b>{data.bot}#{data.type}</b>
                </TableCell>
                <TableCell width={160}>
                    {moment(data.time).format('YYYY-M-D HH:mm')}
                </TableCell>
                <TableCell>
                    <Link href={`#/users/${data.uid}`}>{getUserName(data)}</Link>
                </TableCell>
                <TableCell>
                    {input && input.value}
                </TableCell>
                <TableCell width={30}>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell className={classes.contentCell} colSpan={5}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Grid container className={classes.details}>
                            {Object
                                .keys(data)
                                .filter((key) => !filterProperties.includes(key))
                                .map((key) => (
                                    <Grid item sm={12} md={6} key={key}>
                                        <Typography className={classes.prop}>
                                            <span className={classes.propLabel}><b>{key}:</b></span>
                                            <span title={data[key]}>{data[key]}</span>
                                        </Typography>
                                    </Grid>
                                ))
                            }
                        </Grid>
                        {searchBtn}
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    )
}

export default ({ rows }) => {
    const [page, setPage] = React.useState(0)
    const [rowsPerPage, setRowsPerPage] = React.useState(100)

    React.useEffect(() => setPage(0), [rows])

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value)
        setPage(0)
    }

    const fromIndex = page * rowsPerPage
    const toIndex = fromIndex + rowsPerPage

    return (
        <Paper>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Event</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Input</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.slice(fromIndex, toIndex).map((row) =>
                            (<Row key={`${row.type}_${row.uid}_${row.time}`} data={row} />)
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={rowsPerPageOptions}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={(_, p) => setPage(p)}
                onChangeRowsPerPage={handleChangeRowsPerPage}
            />
        </Paper>
    )
}