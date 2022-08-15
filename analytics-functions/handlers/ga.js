const { google } = require('googleapis')

const scopes = 'https://www.googleapis.com/auth/analytics.readonly'

const privateKey = process.env.PRIVATE_KEY.replace(/\\n/gm, '\n')
const view_id = process.env.VIEW_ID

const auth = new google.auth.GoogleAuth({
    credentials: {
        private_key: privateKey,
        client_email: process.env.CLIENT_EMAIL
    },
    scopes
})


module.exports.handler = async ({ from, to }) => {
    const startDate = from || 'today'
    const endDate = to || 'today'

    const segment = startDate == endDate ? 'ga:hour' : 'ga:date'

    const requestsTmpl = {
        'events': {
            'metrics': 'ga:totalEvents',
            'dimensions': segment + ',ga:eventAction'
        },
        'users': {
            'metrics': 'ga:users',
            'dimensions': segment
        },
        'new_users': {
            'metrics': 'ga:newUsers',
            'dimensions': segment
        },
        'devices': {
            'metrics': 'ga:users',
            'dimensions': 'ga:deviceCategory'
        },
        'sessions': {
            'metrics': 'ga:sessions',
            'dimensions': segment
        },
        'countries' : {
            'metrics': 'ga:sessions',
            'dimensions': 'ga:country'
        },
        'labels': {
            'metrics': 'ga:totalEvents',
            'dimensions': 'ga:eventLabel',
            'sort': '-ga:totalEvents',
            'max-results': 100
        }
    }

    const requests = Object.keys(requestsTmpl)
        .map((key) => ({
            key,
            params: {
                ...requestsTmpl[key],
                'ids': 'ga:' + view_id,
                'start-date': startDate,
                'end-date': endDate,
            }
        }))

    const results = await Promise.all(requests.map(async ({ key, params }) => ({
        key,
        result: (await google.analytics({version: 'v3', auth }).data.ga.get(params)).data.rows
    })))

    return { segment, results }
}