const { google } = require('googleapis')

const scopes = 'https://www.googleapis.com/auth/analytics.readonly'

const privateKey = process.env.PRIVATE_KEY.replace(/\\n/gm, '\n')
const projectId = process.env.PROJECT_ID

const auth = new google.auth.GoogleAuth({
    credentials: {
        private_key: privateKey,
        client_email: process.env.CLIENT_EMAIL
    },
    scopes
})

const reportToGAv3Response = (key, { rows }) => ({
    key,
    result: rows
        ?.map(({ dimensionValues, metricValues }) => {
            let result = []

            if (dimensionValues) {
                result = result.concat(dimensionValues.map(({ value }) => value))
            }

            return result.concat(metricValues.map(({ value }) => value))
        }) ?? []
})

module.exports.handler = async ({ from, to }) => {
    const startDate = from || 'today'
    const endDate = to || 'today'

    const segment = startDate == endDate ? 'hour' : 'date'

    const dateRanges = [{ startDate, endDate }]
    const segmentDemension = { name: segment }
    const orderBys = [{ dimension: { orderType: 'NUMERIC', dimensionName: segment } }]
    const orderByDate = [{ dimension: { orderType: 'NUMERIC', dimensionName: 'date' } }]

    let res = await google.analyticsdata({ version: 'v1beta', auth }).properties.batchRunReports({
        property: `properties/${projectId}`,
        requestBody: {
            requests: [
                {
                    dateRanges,
                    dimensions: [segmentDemension, { name: 'eventName' }],
                    metrics: [{ name: 'eventCount' }],
                    orderBys
                },
                {
                    dateRanges,
                    dimensions: [{ name: 'date' }],
                    metrics: [{ name: 'totalUsers' }],
                    orderBys: orderByDate
                },
                {
                    dateRanges,
                    dimensions: [{ name: 'date' }],
                    metrics: [{ name: 'newUsers' }],
                    orderBys: orderByDate
                },
                {
                    dateRanges,
                    dimensions: [{ name: 'deviceCategory' }],
                    metrics: [{ name: 'totalUsers' }]
                },
                {
                    dateRanges,
                    dimensions: [segmentDemension],
                    metrics: [{ name: 'sessions' }],
                    orderBys
                }
            ]
        }
    })

    const results = [
        reportToGAv3Response('events', res.data.reports[0]),
        reportToGAv3Response('users', res.data.reports[1]),
        reportToGAv3Response('new_users', res.data.reports[2]),
        reportToGAv3Response('devices', res.data.reports[3]),
        reportToGAv3Response('sessions', res.data.reports[4])
    ]

    res = await google.analyticsdata({ version: 'v1beta', auth }).properties.batchRunReports({
        property: `properties/${projectId}`,
        requestBody: {
            requests: [
                {
                    dateRanges,
                    dimensions: [{ name: 'country' }],
                    metrics: [{ name: 'totalUsers' }]
                },
                {
                    dateRanges,
                    dimensions: [{ name: 'pageTitle' }],
                    metrics: [{ name: 'totalUsers' }]
                }
            ]
        }
    })

    results.push(reportToGAv3Response('countries', res.data.reports[0]))
    results.push(reportToGAv3Response('labels', res.data.reports[1]))

    return {
        segment,
        results
    }
}