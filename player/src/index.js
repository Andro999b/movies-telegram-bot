import 'mobx-react-lite/batchingForReactDom'

import React from 'react'
import { render } from 'react-dom'
import App from './App'

render((<App />), document.getElementById('app'))