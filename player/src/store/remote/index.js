import { observable, action } from 'mobx'
import BaseRemoteDevice from './BaseRemoteDevice'
import playerStore from '../player-store'
export class MobileAppRemoteDevice extends BaseRemoteDevice {
    isLocal = () => false

    constructor(device, state) {
        super()
        this.device = device

        if(state) {
            this.onSync(state)
        }
        this.isLoading = true
    }

    getName = () => this.device.name

    disconnect() {
        console.log('disconnect')
        mobileApp.sendDeviceAction('disconnect', '')
    }

    @action sendAction(action, payload) {
        console.log('sendAction', action, JSON.stringify(payload))
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
        console.log('commandListener', action, JSON.stringify(payload))

        switch (action) {
            case 'devicesList': {
                devices.replace(payload)
                return
            }
        }

        if (currentRemoteDevice) {
            switch (action) {
                case 'disconnected': {
                    playerStore.switchToLocalDevice(false)
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

