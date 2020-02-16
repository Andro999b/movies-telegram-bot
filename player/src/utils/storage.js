import store from 'store'
import localStorage from 'store/storages/localStorage'

let storage

if (window.mobileApp) {
    storage = store.createStore({
        name: 'mobileStorage',
        read: (key) => mobileApp.readParam(key),
        write: (key, value) => mobileApp.writeParam(key, value),
        each: function () { },
        remove: (key) => mobileApp.removeParam(key),
        clearAll: function () { }
    })
} else {
    storage = store.createStore(localStorage)
}

export default storage

