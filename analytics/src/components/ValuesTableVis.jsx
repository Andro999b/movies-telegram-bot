import React from 'react'
import {
    makeStyles,
    TableContainer,
    Button,
    Table,
    TableHead,
    TableCell,
    TableBody,
    TableRow
} from '@material-ui/core'
import { grey } from '@material-ui/core/colors'


const useStyles = makeStyles(() => ({
    table: {
        minWidth: 320
    },
    row: {
        '&:last-child > td': {
            borderBottom: 'none'
        },
        '&:nth-child(odd)': {
            backgroundColor: grey[100]
        }
    },
    title: {
        backgroundColor: grey[200]
    },
    value: {
        textAlign: 'right'
    }
}))

const ROWS_COUNT = 26

export default ({ 
    data, 
    showTotal, 
    title, 
    renderName,
    renderValue,
    showRows = ROWS_COUNT 
}) => {
    const classes = useStyles()
    const [showAll, setShowAll] = React.useState(false)
    const hasMore = showRows < data.length

    const rows = showAll ? data : data.slice(0, showRows)
    const total = data.length

    return (
        <TableContainer>
            <Table className={classes.table} size="small">
                {title &&
                    <TableHead>
                        <TableRow className={classes.title}>
                            <TableCell colSpan={2}>{title}</TableCell>
                        </TableRow>
                    </TableHead>
                }
                <TableBody>
                    {showTotal &&
                        <TableRow className={classes.row}>
                            <TableCell><b>Total Row</b></TableCell>
                            <TableCell className={classes.value}>{total}</TableCell>
                        </TableRow>
                    }
                    {rows.map((row, index) => (
                        <TableRow key={index} className={classes.row}>
                            <TableCell>{renderName ? renderName(row) : row.name}</TableCell>
                            <TableCell className={classes.value}>
                                <b>{renderValue ? renderValue(row) : row.value}</b>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {hasMore &&
                <Button onClick={() => setShowAll(!showAll)} >
                    {showAll ? 'Hide All': 'Show All'}
                </Button>
            }
        </TableContainer>
    )
}