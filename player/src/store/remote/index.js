import { observable, action } from 'mobx'
import BaseRemoteDevice from './BaseRemoteDevice'
import playerStore, { LocalDevice } from '../player-store'
export class MobileAppRemoteDevice extends BaseRemoteDevice {
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

    const restoreDevice = () => {
        const deviceInfo = JSON.parse(mobileApp.lastDeviceInfo())
        const deviceState = JSON.parse(mobileApp.lastDeviceState())

        currentRemoteDevice = new MobileAppRemoteDevice(deviceInfo, deviceState)

        return currentRemoteDevice
    }

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


    return {
        devices,
        restoreDevice,
        getRemoteDevice
    }
})()

