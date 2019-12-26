import { observable, action } from 'mobx'
import BaseRemoteDevice from './BaseRemoteDevice'

class MobileAppRemoteDevice extends BaseRemoteDevice {
    isConnected = false

    isLocal = () => false

    constructor(device) {
        super()
        this.device = device
    }

    getName = () => this.device.name

    disconnect() {
        mobileApp.disconnectDevice()
    }

    @action sendAction(action, payload) {
        mobileApp.sendDeviceAction(action, JSON.stringify(payload))
    }

    @action.bound onConnected(state) {
        this.onSync(state)
        this.isLoading = false
        this.isConnected = true
    }

    @action.bound onDisconnected() {
        this.error = 'Device disconnected'
        this.isConnected = false
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
            console.log('commandListener', action, JSON.stringify(payload))

            switch (action) {
                case 'devicesList': {
                    devices.replace(payload)
                    return
                }
                case 'restoreDevice': {
                    return
                }
                case 'deviceClosed': {
                    return
                }
            }

            if (currentRemoteDevice) {
                switch (action) {
                    case 'deviceConnected': {
                        currentRemoteDevice.onConnected(payload)
                        return
                    }
                    case 'deviceDisconnected': {
                        currentRemoteDevice.onDisconnected()
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

