import AWS from 'aws-sdk'
import moment from 'moment'

let docClient
export const getDocClient = () => {
    if (!docClient) docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' })

    return docClient
}

export const getDateFor = (pass) => moment().utc().subtract(pass, 'days').format('YYYY-M-D')
export const getMonthFor = (pass) => moment().utc().subtract(pass, 'months').format('YYYY-M')

export const runQuery = (q) =>
    new Promise((resolve, reject) =>
        getDocClient().query(q, (err, data) => {
            if (err) reject(err)
            else resolve({
                items: data.Items,
                query: q,
                lastKey: data.LastEvaluatedKey
            })
        })
    )

export const getIndexForPeriod = (period) => {
        if (period.includes('day')) return
        return 'monthIdx'
    }