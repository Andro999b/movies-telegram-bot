const { DateTime } = require('luxon')
const { dynamodb } = require('../db/dynamodb')

module.exports = () => {
    const tableName = process.env.ANALYTIC_TABLE || 'analyticsEvents'
    const timezone = process.env.ANALYTIC_TIMEZONE || 'analyticsEvents'
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
            const today = timezone ? DateTime.utc().setZone(timezone) : DateTime.utc()
            const date = today.toFormat('y-M-d')
            const month = today.toFormat('y-M')

            const Item = {
                date: {
                    'S': date
                },
                month: {
                    'S': month
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
            dynamodb.batchWriteItem(
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