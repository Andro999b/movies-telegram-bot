import React from 'react'
import { TableContainer, Button, Table, TableHead, TableCell, TableBody, TableRow } from '@mui/material'

import makeStyles from '@mui/styles/makeStyles'

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 320
  },
  row: {
    '&:last-child > td': {
      borderBottom: 'none'
    },
    '&:nth-child(odd)': {
      backgroundColor: theme.palette.action.disabledBackground
    }
  },
  title: {
    backgroundColor: theme.palette.background.paper
  },
  value: {
    textAlign: 'right'
  }
}))

const ROWS_COUNT = 26

export interface Row {
  name: string
  value: string
}

interface Props<T = Row> {
  data: ReadonlyArray<T>
  showTotal?: boolean
  title: string
  renderName?: (row: T) => JSX.Element | string,
  renderValue?: (row: T) => JSX.Element | string,
  showRows?: number
}

const ValuesTableVis = <T extends object>({
  data,
  showTotal,
  title,
  renderName,
  renderValue,
  showRows = ROWS_COUNT
}: Props<T>): JSX.Element => {
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
          </TableHead>}
        <TableBody>
          {showTotal &&
            <TableRow className={classes.row}>
              <TableCell><b>Total Row</b></TableCell>
              <TableCell className={classes.value}>{total}</TableCell>
            </TableRow>}
          {rows.map((row, index) => (
            <TableRow key={index} className={classes.row}>
              <TableCell>{renderName ? renderName(row) : (row as Row).name}</TableCell>
              <TableCell className={classes.value}>
                <b>{renderValue ? renderValue(row) : (row as Row).value}</b>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {hasMore &&
        <Button onClick={(): void => setShowAll(!showAll)}>
          {showAll ? 'Hide All' : 'Show All'}
        </Button>}
    </TableContainer>
  )
}
export default ValuesTableVis
