import 'mobx-react-lite/batchingForReactDom'

import loadPlaylist from './loadPlaylist.js'
import restoreMobileApp from './restoreMobileApp.js'

if(window.mobileApp && location.hash == '#restoreMobileApp') {
    restoreMobileApp()
} else {
    loadPlaylist()
}