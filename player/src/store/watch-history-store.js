import { Dexie } from 'dexie'
import store from '../utils/storage'
import { observable, action } from 'mobx'
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, child, get, set, query, update, remove } from 'firebase/database'
// import log from '../utils/logger'
const app = initializeApp({
    apiKey: 'AIzaSyCoQdUA6jN3cWx_yopHDVsC2aIW9Bor2P4',
    authDomain: 'movies-player.firebaseapp.com',
    projectId: 'movies-player',
    databaseURL: 'https://movies-player.firebaseio.com/'
})

const auth = getAuth()
const provider = new GoogleAuthProvider()

class RemoteHistoryStorage {
    remoteDb = null
    inited = false

    _getRemoteDB = async () => {
        if (this.inited) return this.remoteDb

        return new Promise((resolve, reject) => {
            onAuthStateChanged(auth, (user) => {
                if (this.inited) {
                    resolve(this.remoteDb)
                    return
                }

                if (user) {
                    this.remoteDb = ref(getDatabase(app), `library/${user.uid}/history`)
                } else {
                    this.remoteDb = null
                }

                this.inited = true

                resolve(this.remoteDb)
            }, reject)
        })
    }

    get = async (key) => {
        const remoteDb = await this._getRemoteDB()

        if (!remoteDb) return

        const snap = await get(child(remoteDb, this._toRemoteKey(key)))
        return snap.val()
    }

    set = async (key, data) => {
        const remoteDb = await this._getRemoteDB()

        if (!remoteDb) return

        await set(child(remoteDb, this._toRemoteKey(key)), {
            key,
            ...data
        })
    }

    update = async (key, data) => {
        const remoteDb = await this._getRemoteDB()

        if (!remoteDb) return

        await update(child(remoteDb, this._toRemoteKey(key)), data)
    }

    delete = async (key) => {
        const remoteDb = await this._getRemoteDB()

        if (!remoteDb) return

        await remove(child(remoteDb, this._toRemoteKey(key)))
    }

    all = async () => {
        const remoteDb = await this._getRemoteDB()

        if (!remoteDb) return []

        const snap = await get(query(remoteDb))
        const out = []
        snap.forEach((d) => out.push(d.val()))
        return out
    }

    _toRemoteKey(key) {
        return key.replace(/[#.]/g, '_')
    }
}

class LocalHistoryStorage {
    localDB = new Dexie('HistoryDatabase')

    constructor() {
        this.localDB
            .version(3)
            .stores({
                history: '&key,provider,id,title,image,time,fileIndex,startTime,audio'
            })
    }

    get = async (key) => this.localDB.history.get(key)

    set = async (key, data) => {
        await this.localDB.history.put({
            key,
            ...data
        })
    }

    update = async (key, data) => {
        await this.localDB.history.update(key, data)
    }

    delete = async (key) => {
        await this.localDB.history
            .where({ key })
            .delete()
    }

    all = async () => this.localDB.history.toArray()
}

class ComposedHistoryStorage {
    initialLoad = false
    updatedKeys = new Set()

    constructor(localHistory, remoteHistory) {
        this.loadHistory = localHistory
        this.remoteHistory = remoteHistory
    }

    get = async (key) => {
        if (!this.updatedKeys.has(key)) {
            const item = await this.remoteHistory.get(key)
            if (item != null) {
                this.updatedKeys.add(key)
                return this._updateLocalItem(item)
            }
        }

        return await this.loadHistory.get(key)
    }

    set = async (key, data) => {
        await Promise.all([
            this.loadHistory.set(key, data),
            this.remoteHistory.set(key, data)
        ])
    }

    update = async (key, data) => {
        await Promise.all([
            this.loadHistory.update(key, data),
            this.remoteHistory.update(key, data)
        ])
    }

    delete = async (key) => {
        await Promise.all([
            this.loadHistory.delete(key),
            this.remoteHistory.delete(key)
        ])
        this.updatedKeys.delete(key)
    }

    all = async () => {
        if (!this.initialLoad) {
            const items = await this.remoteHistory.all()

            await Promise.all(items.map(async (item) => {
                const localItem = await this.loadHistory.get(item.key)
                if (localItem == null || localItem.time < item.time) {
                    await this.loadHistory.set(item.key, item)
                }
            }))

            items.forEach(({ key }) => this.updatedKeys.add(key))
            this.initialLoad = true
        }

        return this.loadHistory.all()
    }

    async _updateLocalItem(item) {
        const localItem = await this.loadHistory.get(item.key)
        if (localItem == null || localItem.time < item.time) {
            await this.loadHistory.set(item)
            return item
        }
        return localItem
    }
}


class WatchHistoryStore {
    @observable insync = false
    @observable history = null

    composedHistory = new ComposedHistoryStorage(
        new LocalHistoryStorage(),
        new RemoteHistoryStorage()
    )

    constructor() {
        onAuthStateChanged(auth, (user) => {
            this.insync = user != null
        })
    }

    @action.bound loadHistory = async () => {
        const items = await this.composedHistory.all()
        this.history = items.sort((a, b) => b.time - a.time)
    }

    @action.bound connect() {
        signInWithPopup(auth, provider)
            .then(this.loadHistory)
            .catch((error) => {
                console.error('Fail login', error)
            })
    }

    @action.bound disconnect() {
        signOut(auth)
    }

    watching = async ({ provider, id, title, image }) => {
        const key = this._getItemKey(provider, id)
        const item = await this.composedHistory.get(key)
        await this.composedHistory.set(key, {
            ...item,
            key,
            provider,
            id,
            title,
            image,
            time: Date.now()
        })
    }

    deleteFromHistory = async (key) =>
        this.composedHistory.delete(key)

    updateLastEpisode = async ({ provider, id }, fileIndex) =>
        this.composedHistory.update(this._getItemKey(provider, id), { fileIndex, time: Date.now() })

    updateLastEpisodePosition = async ({ provider, id }, startTime) => {
        store.set(`playlist:${provider}:${id}:ts`, startTime)
    }

    lastEpisode = async ({ provider, id }) => {
        const key = this._getItemKey(provider, id)
        const item = await this.composedHistory.get(key)
        const startTime = store.get(`playlist:${provider}:${id}:ts`)
        return {
            fileIndex: item?.fileIndex ?? 0,
            startTime
        }
    }

    updateAudioTrack = async ({ provider, id }, audio) =>
        this.composedHistory.update(this._getItemKey(provider, id), { audio, time: Date.now() })

    audioTrack = async ({ provider, id }) => {
        const key = this._getItemKey(provider, id)
        const item = await this.composedHistory.get(key)
        return item?.audio
    }

    _getItemKey(provider, id) {
        return `${provider}#${id}`
    }
}

export default new WatchHistoryStore()