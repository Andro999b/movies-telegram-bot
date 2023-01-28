import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Button,
  Select,
  TextField
} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import React from 'react'

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: theme.spacing(1),
    width: '100%'
  }
}))

interface Props {
  open: boolean
  providers: string[]
  onInvalidate: (provider: string, resultId: string) => void
  onClose: () => void

}

const InvalidateDialog: React.FC<Props> = ({ open, providers, onInvalidate, onClose }) => {
  const classes = useStyles()

  const [provider, setProvider] = React.useState(providers[0])
  const [resultId, setResultId] = React.useState('')
  const [confirm, setConfirm] = React.useState(false)

  const handleClose = (): void => {
    setConfirm(false)
    setResultId('')
    onClose()
  }

  const handleConfirm = (): void => {
    setConfirm(true)
  }

  const handleInvalidate = (): void => {
    onInvalidate(provider, resultId)
    handleClose()
  }

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Invalidate Cache</DialogTitle>
      <DialogContent>
        <FormControl className={classes.formControl}>
          <Select
            value={provider}
            onChange={(e): void => setProvider(e.target.value)}
            fullWidth
          >
            {providers.map((providerName) => (
              <MenuItem key={providerName} value={providerName}>{providerName}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl className={classes.formControl}>
          <TextField label="Result ID" fullWidth value={resultId} onChange={(e): void => setResultId(e.target.value)} />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        {confirm ?
          <Button color="secondary" onClick={handleInvalidate}>Confirm</Button> :
          <Button color="primary" onClick={handleConfirm} autoFocus>Delete</Button>}
      </DialogActions>
    </Dialog>
  )
}

export default InvalidateDialog
