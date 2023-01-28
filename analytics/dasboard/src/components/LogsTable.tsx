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
  Table,
} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material'
import clsx from 'clsx'
import Linkify from 'linkifyjs/react'
import theme from '../theme'
import { ResultField } from '@aws-sdk/client-cloudwatch-logs'

const rowsPerPageOptions = [25, 50, 100]

const useStyles = makeStyles(() => ({
  row: {
    display: 'flex',
    width: '100%'
  },
  tbody: {
    display: 'flex',
    overflow: 'hidden',
    width: '100%',
    flexDirection: 'column'
  },
  timestampCell: {
    display: 'inline-block',
    width: 120,
  },
  messageCell: {
    flexGrow: 1,
    width: 0 //i hate this fucking  css 
  },
  message: {
    display: 'inline-block',
    wordWrap: 'break-word',
    width: '100%'
  },
  messageClose: {
    overflow: 'hidden',
    height: 48
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

interface RowProps {
  timestamp: string
  message: string
  log: string
}

const Row: React.FC<RowProps> = ({ timestamp, message, log }) => {
  const classes = useStyles()
  const [open, setOpen] = React.useState(false)
  const [formatedMessage, setFormatedMessage] = React.useState<JSX.Element | string | null>(null)

  let displayMessage: JSX.Element | string | null = message
  if (open) {
    if (formatedMessage === null) {
      displayMessage = message.replace(/({.*})/, (m, p) => {
        try {
          return JSON.stringify(JSON.parse(p), null, 2)
        } catch {
          return p
        }
      })
      displayMessage = // @ts-ignore
        (<Linkify options={{ target: { url: '_blank' }, className: classes.link }}>
          {displayMessage}
        </Linkify>)
      setFormatedMessage(displayMessage)
    }
    displayMessage = formatedMessage
  }

  return (
    <TableRow className={classes.row}>
      <TableCell className={classes.timestampCell}>
        <Typography>
          <b>{timestamp}</b>
        </Typography>
      </TableCell>
      <TableCell className={classes.messageCell}>
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
        <IconButton size="small" onClick={(): void => setOpen(!open)}>
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </TableCell>
    </TableRow>
  )
}

interface Props {
  rows: ResultField[][]
}

const LogsTable: React.FC<Props> = ({ rows }) => {
  const classes = useStyles()

  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(100)

  React.useEffect(() => setPage(0), [rows])

  const handleChangeRowsPerPage: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> =
    (event) => {
      setRowsPerPage(+event.target.value)
      setPage(0)
    }

  const fromIndex = page * rowsPerPage
  const toIndex = fromIndex + rowsPerPage

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead className={classes.tbody}>
            <TableRow className={classes.row}>
              <TableCell className={classes.timestampCell}>Time</TableCell>
              <TableCell className={classes.messageCell}>Message</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody className={classes.tbody}>
            {rows.slice(fromIndex, toIndex)
              .map(([timestamp, message, log, ptr]) => (
                <Row
                  key={ptr.value}
                  timestamp={timestamp.value!}
                  log={log.value!}
                  message={message.value!}
                />)
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
        onPageChange={(_, p): void => setPage(p)}
        onRowsPerPageChange={handleChangeRowsPerPage} />
    </Paper>
  )
}

export default LogsTable
