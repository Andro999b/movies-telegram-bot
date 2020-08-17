const { google } = require('googleapis')

const scopes = 'https://www.googleapis.com/auth/analytics.readonly'

const privateKey = process.env.PRIVATE_KEY.replace(/\\n/gm, '\n')
const jwt = new google.auth.JWT(process.env.CLIENT_EMAIL, null, privateKey, scopes)
const view_id = process.env.VIEW_ID


module.exports.handler = async ({ from, to }) => {
    await jwt.authorize()

    const requestsTmpl = {
        'events': {
            'metrics': 'ga:totalEvents',
            'dimensions': 'ga:date,ga:eventAction'
        },
        'users': {
            'metrics': 'ga:users',
            'dimensions': 'ga:date'
        },
        'newUsers': {
            'metrics': 'ga:newUsers',
            'dimensions': 'ga:date'
        },
        'sessions': {
            'metrics': 'ga:sessions',
            'dimensions': 'ga:date'
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
            ...requestsTmpl[key],
            'auth': jwt,
            'ids': 'ga:' + view_id,
            'ids': 'ga:' + view_id,
            'start-date': from || 'today',
            'end-date': to || 'today',
        }))

    const results = await Promise.all(requests.map(async (data) =>
        await google.analytics('v3').data.ga.get(data)
    ))

    return results
}