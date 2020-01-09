import React from 'react'
import { render } from 'react-dom'

import App from './App'
import playerStore from './store/player-store'
import remote from './store/remote'

export default function () {
    playerStore.setDevice(remote.restoreDevice())
    render((<App started={true} />), document.getElementById('app'))
}