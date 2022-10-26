import 'mobx-react-lite/batchingForReactDom'

import React from 'react'
import { render } from 'react-dom'
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import App from './App'

console.log('Realeas:', process.env.RELEASE) // eslint-disable-line 
Sentry.init({
    release: process.env.RELEASE,
    dsn: 'https://8135c86220da469f827d38a37cf1cd46@o4504040087617536.ingest.sentry.io/4504040097120256',
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
})


// just silence fullscrean errors
document.addEventListener('fullscreenerror', () =>
    console.log('fullscrean denied') // eslint-disable-line no-console
)

render((<App />), document.getElementById('app'))