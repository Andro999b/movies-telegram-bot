import remote from './remote'
import playerStore from './player-store'
import notifications from './notifications-store'
import { action, observable } from 'mobx'

class CastStore {
    devices = remote ? remote.devices : []
    castAvalaible = remote != null
    @observable castDialog = null

    @action.bound showCastDialog(cb) {
        const onDeviceSelected = (device) => {
            playerStore.switchDevice(remote.getRemoteDevice(device))
            this.closeCastDailog()
            notifications.showMessage(`Connected to: ${device.name}`)

            if(typeof cb == 'function') cb()
        }

        this.castDialog = { onDeviceSelected }
    }

    @action.bound closeCastDailog() {
        this.castDialog = null
    }
}

export default new CastStore()