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
    IconButton,
    makeStyles,
    Table
} from '@material-ui/core'
import {
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon
} from '@material-ui/icons'
import clsx from 'clsx'
import Linkify from 'linkifyjs/react'
import theme from '../theme'

const rowsPerPageOptions = [25, 50, 100]

const useRowStyles = makeStyles(() => ({
    timestamp: {
        display: 'inline-block',
        width: 120,
        height: 48
    },
    message: {
        wordWrap: 'anywhere'
    },
    messageClose: {
        height: 48,
        overflow: 'hidden',
    },
    messageOpen: {
        whiteSpace: 'break-spaces'
    },
    top: {
        verticalAlign: 'top'
    },
    link: {
        color: theme.palette.primary.main
    }
}))

const Row = ({ timestamp, message, log }) => {
    const classes = useRowStyles()
    const [open, setOpen] = React.useState(false)
    const [formatedMessage, setFormatedMessage] = React.useState(null)

    let displayMessage = message
    if (open) {
        if (formatedMessage === null) {
            displayMessage = message.replace(/({.*})/, (m, p) => {
                try {
                    return JSON.stringify(JSON.parse(p), null, 2)
                } catch {
                    return p
                }
            })
            displayMessage =
                (<Linkify options={{ target: { url: '_blank' }, className: classes.link }}>
                    {displayMessage}
                </Linkify>)
            setFormatedMessage(displayMessage)
        }
        displayMessage = formatedMessage
    }

    return (
        <TableRow className={classes.root}>
            <TableCell className={classes.top}>
                <Typography className={classes.timestamp}>
                    <b>{timestamp}</b>
                </Typography>
            </TableCell>
            <TableCell>
                <Typography variant='caption'>{log}</Typography>
                <Typography className={clsx({
                    [classes.message]: true,
                    [classes.messageClose]: !open,
                    [classes.messageOpen]: open,
                })}>
                    {displayMessage}
                </Typography>
            </TableCell>
            <TableCell className={classes.top}>
                <IconButton size="small" onClick={() => setOpen(!open)}>
                    {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
            </TableCell>
        </TableRow>
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
                            <TableCell>Time</TableCell>
                            <TableCell>Message</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.slice(fromIndex, toIndex).map(([timestamp, message, log, ptr]) =>
                            <Row key={ptr.value} timestamp={timestamp.value} log={log.value} message={message.value} />
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