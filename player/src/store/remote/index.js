import { observable, action } from 'mobx'
import BaseRemoteDevice from './BaseRemoteDevice'
import playerStore, { LocalDevice } from '../player-store'

class MobileAppRemoteDevice extends BaseRemoteDevice {
    isLocal = () => false

    constructor(device, state) {
        super()
        this.device = device

        if(state) {
            this.onSync(state)
        }
    }

    getName = () => this.device.name

    disconnect() {
        mobileApp.sendDeviceAction('disconnect', '')
    }

    @action sendAction(action, payload) {
        mobileApp.sendDeviceAction(action, JSON.stringify(payload))
    }
}

export default (() => {
    if(!window.mobileApp) return null

    const devices = observable.array([])

    let currentRemoteDevice

    const getRemoteDevice = (device) => {
        currentRemoteDevice = new MobileAppRemoteDevice(device)
        mobileApp.connectToDevice(device.id)
        return currentRemoteDevice
    }

    if (window.mobileApp != null) {
        mobileApp.setCommandListener('commandListener')

        window.commandListener = ({ action, payload }) => {
            switch (action) {
                case 'devicesList': {
                    devices.replace(payload)
                    return
                }
            }

            if (currentRemoteDevice) {
                switch (action) {
                    case 'disconnected': {
                        playerStore.switchDevice(new LocalDevice())
                        currentRemoteDevice = null
                        return
                    }
                    case 'sync': {
                        currentRemoteDevice.onSync(payload)
                        return
                    }
                }
            }
        }
    }

    return {
        devices,
        getRemoteDevice
    }
})()

