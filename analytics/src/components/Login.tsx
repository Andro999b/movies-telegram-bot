import React from 'react'
import makeStyles from '@mui/styles/makeStyles'
import {
  TextField,
  Button,
  FormControl,
  Typography
} from '@mui/material'
import LoadingPlaceholder from './LoadingPlaceholder'
import { userPool } from '../database/userpool'
import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js'

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: theme.palette.background.default
  },
  root: {
    '&': {
      display: 'flex',
      width: 260
    },
    '& > *': {
      margin: theme.spacing(1)
    }
  },
  error: {
    color: theme.palette.error.dark,
    textAlign: 'center'
  }
}))

interface UserData {
  user: CognitoUser
  userAttributes: Record<string, string>
}

export function withLogin(Component: React.ElementType): React.FC {
  const Login: React.FC = () => {
    const [step, setStep] = React.useState('RESTORE')
    const [password, setPassword] = React.useState('')
    const [username, setUsername] = React.useState('')
    const [error, setError] = React.useState('')
    const [userData, setUserData] = React.useState<UserData>()
    const [loading, setLoading] = React.useState(true)
    const classes = useStyles()

    React.useEffect(() => {
      const user = userPool.getCurrentUser()
      if (user) {
        setStep('SIGNED')
        setLoading(false)
      } else {
        setStep('NOT_SIGNED')
        setLoading(false)
      }
    }, [])

    const doLogin = (e: React.FormEvent): void => {
      e.preventDefault()
      setError('')
      setLoading(true)

      const authDetails = new AuthenticationDetails({
        Username: username,
        Password: password
      })

      const user = new CognitoUser({
        Username: username,
        Pool: userPool
      })

      user.authenticateUser(authDetails, {
        onSuccess: () => {
          setStep('SIGNED')
          setLoading(false)
        },
        onFailure: (err) => {
          setError(err.message)
          setLoading(false)
          console.error(err)
        },
        newPasswordRequired: (userAttributes) => {
          setStep('NEW_PASSWORD_REQUIRED')
          setLoading(false)
          setPassword('')
          setUserData({ user, userAttributes })
        }
      })
    }

    const doChangePassword = (e: React.FormEvent): void => {
      e.preventDefault()
      setError('')
      setLoading(true)

      const { user, userAttributes } = userData!

      delete userAttributes.email_verified
      delete userAttributes.email

      user.completeNewPasswordChallenge(password, userAttributes, {
        onSuccess: () => {
          setStep('NOT_SIGNED')
          setLoading(false)
        },
        onFailure: (err) => {
          setError(err.message)
          setLoading(false)
          console.error(err)
        },
      })
    }

    let form

    if (step == 'NEW_PASSWORD_REQUIRED') {
      form = (
        <form onSubmit={doChangePassword}>
          <FormControl className={classes.root}>
            <Typography className={classes.error}>{error}</Typography>
            <TextField autoFocus name="password" type="password" label="New Password" value={password} onChange={(e): void => setPassword(e.target.value)} />
            <Button disableElevation type="submit" variant="contained" color="primary" onClick={doChangePassword}>Set Password</Button>
          </FormControl>
        </form>
      )
    } else if (step == 'NOT_SIGNED') {
      form = (
        <form onSubmit={doLogin}>
          <FormControl className={classes.root}>
            <Typography className={classes.error}>{error}</Typography>
            <TextField autoFocus name="email" autoComplete="email" label="Email" value={username} onChange={(e): void => setUsername(e.target.value)} />
            <TextField autoComplete="current-password" name="password" type="password" label="Password" value={password} onChange={(e): void => setPassword(e.target.value)} />
            <Button disableElevation type="submit" variant="contained" color="primary" onClick={doLogin}>Loggin</Button>
          </FormControl>
        </form>
      )
    }

    if (form || loading) {
      return (
        <LoadingPlaceholder loading={loading}>
          <div className={classes.container}>{form}</div>
        </LoadingPlaceholder>
      )
    }

    return <Component />
  }

  return Login
}
