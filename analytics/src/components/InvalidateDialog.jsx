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
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import React from 'react'
import { PROVIDERS } from '../constants'

const useStyles = makeStyles((theme) => ({
    formControl: {
        marginBottom: theme.spacing(1),
        width: '100%'
    }
}))

export default ({ open, providers = PROVIDERS, onInvalidate, onClose }) => {
    const classes = useStyles()

    const [provider, setProvider] = React.useState(providers[0])
    const [resultId, setResultId] = React.useState('')
    const [confirm, setConfirm] = React.useState(false)

    const handleClose = () => {
        setConfirm(false)
        setResultId('')
        onClose()
    }

    const handleConfirm = () => {
        setConfirm(true)
    }

    const handleInvalidate = () => {
        const data = { provider, resultId }
        onInvalidate(data)
        handleClose()
    }

    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>Invalidate Cache</DialogTitle>
            <DialogContent>
                <FormControl className={classes.formControl}>
                    <Select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        fullWidth
                    >
                        {providers.map((providerName) => (
                            <MenuItem key={providerName} value={providerName}>{providerName}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                    <TextField label="Result ID" fullWidth value={resultId} onChange={(e) => setResultId(e.target.value)}/>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                { confirm ? 
                    <Button color="secondary" onClick={handleInvalidate}>Confirm</Button>:
                    <Button color="primary" onClick={handleConfirm} autoFocus>Delete</Button>
                }
            </DialogActions>
        </Dialog>
    )
}