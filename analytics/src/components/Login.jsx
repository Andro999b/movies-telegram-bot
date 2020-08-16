import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';
import {
    CognitoUserPool,
    AuthenticationDetails,
    CognitoUser
} from 'amazon-cognito-identity-js'
import {
    TextField,
    Button,
    FormControl,
    Typography
} from '@material-ui/core';
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import AWS from 'aws-sdk'

import {
    REGION,
    IDENTITY_POOL_ID,
    USER_POOL_ID,
    APP_CLIENT_ID
} from '../constants'

export function withLogin(Component) {
    const useStyles = makeStyles((theme) => ({
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%'
        },
        root: {
            '&': {
                display: 'block',
                margin: 'auto',
                width: 216
            },
            '& > *': {
                margin: theme.spacing(1),
                width: '25ch',
            }
        },
        error: {
            color: red[900],
            textAlign: 'center',
            width: 200
        }
    }))

    return () => {
        const [step, setStep] = React.useState('NOT_SIGNED')
        const [password, setPassword] = React.useState('')
        const [username, setUsername] = React.useState('')
        const [error, setError] = React.useState('')
        const [userData, setUserData] = React.useState()
        const [loading, setLoading] = React.useState(false)
        const classes = useStyles()

        const doLogin = (e) => {
            e.preventDefault()
            setError('')
            setLoading(true)

            const authDetails = new AuthenticationDetails({
                Username: username,
                Password: password
            })

            const userPool = new CognitoUserPool({
                UserPoolId: USER_POOL_ID,
                ClientId: APP_CLIENT_ID
            })

            const user = new CognitoUser({
                Username: username,
                Pool: userPool
            })

            user.authenticateUser(authDetails, {
                onSuccess: (result) => {
                    AWS.config.region = REGION
                    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                        IdentityPoolId: IDENTITY_POOL_ID,
                        Logins: {
                            [`cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`]: result.getIdToken().getJwtToken()
                        }
                    })
                    AWS.config.credentials.refresh((error) => {
                        if (error) {
                            setError(error.message)
                            console.error(error);
                        } else {
                            setStep('SIGNED')
                        }
                        setLoading(false)
                    });
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

        const doChangePassword = (e) => {
            e.preventDefault()
            setError('')
            setLoading(true)

            const { user, userAttributes } = userData

            delete userAttributes.email_verified
            user.completeNewPasswordChallenge(password, userAttributes, {
                onSuccess: (result) => {
                    console.log(result)
                    setStep('SIGNED')
                    setLoading(false)
                },
                onFailure: (err) => {
                    setError(err.message)
                    setLoading(false)
                    console.error(err);
                },
            })
        }

        let form

        if (step == 'NEW_PASSWORD_REQUIRED') {
            form = (
                <form onSubmit={doChangePassword}>
                    <FormControl className={classes.root}>
                        <Typography className={classes.error}>{error}</Typography>
                        <TextField autoFocus name="password" type="password" label="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <Button disableElevation type="submit" variant="contained" color="primary" onClick={doChangePassword}>Set Password</Button>
                    </FormControl>
                </form>
            )
        } else if (step == 'NOT_SIGNED') {
            form = (
                <form onSubmit={doLogin}>
                    <FormControl className={classes.root}>
                        <Typography className={classes.error}>{error}</Typography>
                        <TextField autoFocus name="email" autoComplete="email" label="Email" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <TextField autoComplete="current-password" name="password" type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <Button disableElevation type="submit" variant="contained" color="primary" onClick={doLogin}>Loggin</Button>
                    </FormControl>
                </form>
            )
        }

        if (form) {
            return (
                <LoadingPlaceholder loading={loading}>
                    <div className={classes.container}>{form}</div>
                </LoadingPlaceholder>
            )
        }

        return <Component />
    }
}