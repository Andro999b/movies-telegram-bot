import './aws-sdk'
import React from 'react'
import { render } from 'react-dom'
import 'mobx-react-lite/batchingForReactDom'
import App from './App'


render((<App />), document.getElementById('app'))