import { REGION, ACCOUNT_ID } from '../constants'

let lambda
export const getLambda = () => {
    if (!lambda) lambda = new AWS.Lambda({ apiVersion: '2015-03-31', reqion: REGION })

    return lambda
}

export const invokeGA = (from, to) => new Promise((resolve, reject) => {
    var params = {
        FunctionName: `arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:analytics-functions-dev-ga4`,
        Payload: JSON.stringify({from, to})
    }
    getLambda().invoke(params, function (err, data) {
        if (err) {
            console.error('invokeGA', err)
            reject(err) 
        } else {
            resolve(JSON.parse(data.Payload))
        }           
    })
})

export const invokeMongoStat = () => new Promise((resolve, reject) => {
    var params = {
        FunctionName: `arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:analytics-functions-dev-mongostat`
    }
    getLambda().invoke(params, function (err, data) {
        if (err) {
            console.error('invokeMongoStat', err)
            reject(err) 
        } else resolve(JSON.parse(data.Payload))           
    })
})

export const invokeMongoInvalidate = (provider, resultId) =>  new Promise((resolve, reject) => {
    var params = {
        FunctionName: `arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:analytics-functions-dev-mongoinvalidate`,
        Payload: JSON.stringify({provider, resultId})
    }
    getLambda().invoke(params, function (err, data) {
        if (err) reject(err) 
        else resolve(JSON.parse(data.Payload))           
    })
})