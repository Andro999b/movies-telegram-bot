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
    }
}))

const Row = ({ timestamp, message }) => {
    const classes = useRowStyles()
    const [open, setOpen] = React.useState(false)

    let displayMessage = message
    if (open) {
        if (message.startsWith('{')) {
            try {
                displayMessage = JSON.stringify(JSON.parse(message), null, 2)
            } catch {
                //no-op
            }
        }
        displayMessage =
            (<Linkify options={{ target: { url: '_blank' } }}>
                {displayMessage} 
            </Linkify>)
    }

    return (
        <TableRow className={classes.root}>
            <TableCell className={classes.top}>
                <Typography className={classes.timestamp}>
                    <b>{timestamp}</b>
                </Typography>
            </TableCell>
            <TableCell>
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
                        {rows.slice(fromIndex, toIndex).map(([timestamp, message, ptr]) =>
                            <Row key={ptr.value} timestamp={timestamp.value} message={message.value} />
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