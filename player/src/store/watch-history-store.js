import { Dexie } from 'dexie'
import store from '../utils/storage'
import { observable, action } from 'mobx'
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, child, get, set, query, update, remove } from 'firebase/database'
import log from '../utils/logger'
const app = initializeApp({
    apiKey: 'AIzaSyCoQdUA6jN3cWx_yopHDVsC2aIW9Bor2P4',
    authDomain: 'movies-player.firebaseapp.com',
    projectId: 'movies-player',
    databaseURL: 'https://movies-player.firebaseio.com/'
})

const auth = getAuth()
const provider = new GoogleAuthProvider()

class WatchHistoryStore {
    @observable insync = false
    @observable history = null

    constructor() {
        this.localDB = new Dexie('HistoryDatabase')
        this.localDB.version(3).stores({
            history: '&key,provider,id,title,image,time,fileIndex,startTime,audio'
        })
        onAuthStateChanged(auth, (user) => {
            this.insync = user != null
            if (this.insync) {
                this.remoteDb = ref(getDatabase(app), `library/${user.uid}/history`)
            } else {
                this.remoteDb = null
            }
            this._loadHistory()
        })
    }

    _loadHistory = async () => {
        const [remoteHistory, localHistory] = await Promise.all([
            this._remoteHistory(),
            this._localHistory()
        ])

        if (remoteHistory.length) {
            const sean = new Set(remoteHistory.map((i) => i.key))
            this.history = remoteHistory.concat(localHistory.filter((i) => !sean.has(i.key)))
        } else {
            this.history = localHistory
        }
    }

    @action.bound connect() {
        signInWithPopup(auth, provider)
            .catch((error) => {
                console.error('Fail login', error)
            })
    }

    @action.bound disconnect() {
        signOut(auth)
    }

    watching = (playlist) => {
        return Promise.all([
            this._localWatching(playlist),
            this._remoteWatching(playlist).catch((e) => log.error(e.message, e))
        ])
            .then(this._loadHistory)
    }

    deleteFromHistory = (key) => {
        Promise.all([
            this._localDelete(key),
            this._remoteDelete(key).catch((e) => log.error(e.message, e))
        ])
            .then(this._loadHistory)
    }

    updateLastEpisode = ({ provider, id }, fileIndex) => {
        const key = `${provider}#${id}`
        return Promise.all([
            this._localUpdate(key, { fileIndex }),
            this._remoteUpdate(key, { fileIndex }).catch((e) => log.error(e.message, e))
        ])
    }


    updateLastEpisodePosition = ({ provider, id }, startTime) => {
        store.set(`playlist:${provider}:${id}:ts`, startTime)
    }

    lastEpisode = ({ provider, id }) => {
        const key = `${provider}#${id}`
        return this._remoteGet(key)
            .then((item) => item || this._localGet(key))
            .then((item) => {
                if (item && item.fileIndex) {
                    return {
                        fileIndex: item.fileIndex,
                        startTime: store.get(`playlist:${provider}:${id}:ts`)
                    }
                } else {
                    return {
                        fileIndex: store.get(`playlist:${provider}:${id}:current`),
                        startTime: store.get(`playlist:${provider}:${id}:ts`)
                    }
                }
            })
    }

    updateAudioTrack = ({ provider, id }, audio) => {
        const key = this._getItemKey(provider, id)
        return Promise.all([
            this._localUpdate(key, { audio }),
            this._remoteUpdate(key, { audio })
        ])
            .catch(console.error)
    }

    audioTrack = ({ provider, id }) => {
        const key = this._getItemKey(provider, id)
        return this.localDB.history.get(key)
            .then((item) => {
                if (item && item.audio) {
                    return item.audio
                } else {
                    return store.get(`playlist:${provider}:${id}:audio`)
                }
            })
    }

    async _remoteGet(key) {
        if (!this.remoteDb)
            return Promise.resolve()

        const snap = await get(child(this.remoteDb, this._toRemoteKey(key)))
        return snap.val()
    }

    async _remoteHistory() {
        if (!this.remoteDb) return []

        const snap = await get(query(this.remoteDb))
        const out = []
        snap.forEach((d) => {
            out.push(d.val())
        })
        return out.sort((a, b) => b.time - a.time)
    }

    async _remoteUpdate(key, data) {
        if (!this.remoteDb)
            return

        return update(child(this.remoteDb, this._toRemoteKey(key)), data)
    }

    async _remoteDelete(key) {
        if (!this.remoteDb)
            return

        return remove(child(this.remoteDb, this._toRemoteKey(key)))
    }

    async _remoteWatching({ provider, id, title, image }) {
        if (!this.remoteDb)
            return

        const key = this._getItemKey(provider, id)
        const remoteKey = this._toRemoteKey(key)

        const data = await this._remoteGet(remoteKey)
        await set(child(this.remoteDb, remoteKey), {
            ...data,
            key,
            provider,
            id,
            title,
            image,
            time: Date.now()
        })
    }

    _toRemoteKey(key) {
        return key.replace(/[#.]/g, '_')
    }

    _localHistory() {
        return this.localDB.history.orderBy('time')
            .reverse()
            .toArray()
    }

    _localGet(key) {
        return this.localDB.history.get(key)
    }

    _localUpdate(key, data) {
        return this.localDB.history.update(key, data)
    }

    _localDelete(key) {
        return this.localDB.history
            .where({ key })
            .delete()
    }

    async _localWatching({ provider, id, title, image }) {
        const key = this._getItemKey(provider, id)
        const updated = await this.localDB.history
            .update(key, {
                time: Date.now()
            })

        if (updated != 0)
            return

        await this.localDB.history.put({
            key,
            provider,
            id,
            title,
            image,
            time: Date.now()
        })
    }

    _getItemKey(provider, id) {
        return `${provider}#${id}`
    }
}

export default new WatchHistoryStore()