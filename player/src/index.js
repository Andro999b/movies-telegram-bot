import React from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import App from './App'

console.log('Release:', process.env.RELEASE) // eslint-disable-line 
Sentry.init({
  release: process.env.RELEASE,
  dsn: 'https://8135c86220da469f827d38a37cf1cd46@o4504040087617536.ingest.sentry.io/4504040097120256',
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
})


// just silence fullscrean errors
// document.addEventListener('fullscreenerror', () =>
//     console.log('fullscrean denied') // eslint-disable-line no-console
// )

const container = document.getElementById('app')
const root = createRoot(container)
root.render(<App />)
