import { CognitoUserPool, CognitoUserSession } from 'amazon-cognito-identity-js'
import { USER_POOL_ID, APP_CLIENT_ID, IDENTITY_POOL_ID, REGION } from '../constants'
import { CognitoIdentityCredentialProvider, fromCognitoIdentityPool } from '@aws-sdk/credential-providers'

export const userPool = new CognitoUserPool({
  UserPoolId: USER_POOL_ID,
  ClientId: APP_CLIENT_ID
})

export const getCredentialProvider = (): Promise<CognitoIdentityCredentialProvider> => new Promise((resolve, reject) => {
  const user = userPool.getCurrentUser()
  if (user) {
    user.getSession((err: Error | null, session: CognitoUserSession): void => {
      if (err) {
        reject(err)
      } else {
        resolve(fromCognitoIdentityPool({
          identityPoolId: IDENTITY_POOL_ID,
          logins: {
            [`cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`]: session.getIdToken().getJwtToken()
          },
          clientConfig: { region: REGION }
        }))
      }
    })
  } else {
    reject(new Error('No user'))
  }
})
