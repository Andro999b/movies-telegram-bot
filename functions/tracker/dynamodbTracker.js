const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

module.exports = () => {
    const tableName = process.env.ANALYTIC_TABLE || 'analyticsEvents'
    const analyticsTTL = 3600 * 24 * (process.env.ANALYTIC_RETENTION || 90)

    const typeMapping = {
        uid: 'N',
        time: 'N',
        resultsCount: 'N'
    }

    const mapper = (key, value) => {
        const type = typeMapping[key] || 'S'

        if(Array.isArray(value)) {
            value = value.join(',')
        } else if(value === undefined || value === null) {
            value = ''
        } else {
            value = '' + value
        }

        return { [type]: value }
    }

    return async (events) => {
        const requests = events.map((event) => {
            const today = new Date();
            const date = today.getFullYear() + '-' + (today.getMonth() + 1 ) + '-' + today.getDate();

            const Item = {
                date: {
                    'S': date
                },
                ttl: {
                    'N': '' + (Math.floor(Date.now() / 1000) + analyticsTTL)
                }
            }

            Object.keys(event).forEach((key) => {
                Item[key] = mapper(key, event[key])
            })

            // console.log(Item, events);

            return { PutRequest: { Item } }
        })

        await new Promise((resolve, reject) => {
            ddb.batchWriteItem(
                {
                    RequestItems: {
                        [tableName]: requests
                    }
                },
                (err) => {
                    if (err) reject(err); else resolve()
                }
            )
        })
    }
}