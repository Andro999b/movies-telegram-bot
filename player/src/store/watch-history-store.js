import { Dexie } from 'dexie'
import store from '../utils/storage'
import { observable, action } from 'mobx'
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore'
import log from '../utils/logger'
initializeApp({
    apiKey: 'AIzaSyCoQdUA6jN3cWx_yopHDVsC2aIW9Bor2P4',
    authDomain: 'movies-player.firebaseapp.com',
    projectId: 'movies-player'
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
            if(this.insync) {
                this.remoteDb = collection(getFirestore(), 'library', user.uid, 'history')
            } else {
                this.remoteDb = null
            }
            this._loadHistory()
        })
    }

    _loadHistory = () => 
        Promise.all([
            this._remoteHistory(),
            this._localHistory()
        ]).then(([remoteHistory, localHistory]) => {
            if(remoteHistory.length) {
                const sean = new Set(remoteHistory.map((i) => i.key))
                this.history = remoteHistory.concat(localHistory.filter((i) => !sean.has(i.key)))
            } else {
                this.history = localHistory
            }
        })

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
        return Promise.all([
            this._localDelete(key),
            this._remoteDelete(key).catch((e) => log.error(e.message, e))
        ])
            .then(this._loadHistory)
    }

    updateLastEpisode = ({provider, id}, fileIndex) => {
        const key = `${provider}#${id}`
        return Promise.all([
            this._localUpdate(key, { fileIndex }),
            this._remoteUpdate(key, { fileIndex }).catch((e) => log.error(e.message, e))
        ])
    }


    updateLastEpisodePosition = ({provider, id}, startTime) => {
        store.set(`playlist:${provider}:${id}:ts`, startTime)
    }

    lastEpisode = ({provider, id}) => {
        const key = `${provider}#${id}`
        return this._remoteGet(key)
            .then((item) => item || this._localGet(key))
            .then((item) => {
                if(item && item.fileIndex) {
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
    
    updateAudioTrack = ({provider, id}, audio) => {
        const key = `${provider}#${id}`
        return Promise.all([
            this._localUpdate(key, { audio }),
            this._remoteUpdate(key, { audio })
        ])
            .catch(console.error)
    }

    audioTrack = ({provider, id}) => {
        const key = `${provider}#${id}`
        return this.localDB.history.get(key)
            .then((item) => {
                if(item && item.audio) {
                    return item.audio
                } else {
                    return store.get(`playlist:${provider}:${id}:audio`)
                }
            })
    }

    _remoteGet(key) {
        if(!this.remoteDb)
            return Promise.resolve()

        return getDoc(doc(this.remoteDb, key)).then((snap) => snap.data())
    }

    _remoteHistory() {
        if(!this.remoteDb)
            return Promise.resolve([])

        return getDocs(query(this.remoteDb, orderBy('time', 'desc'))).then((snap) => {
            const out = []
            snap.forEach((d) => {
                out.push(d.data())
            })
            return out
        })       
    }

    _remoteUpdate(key, data) {
        if(!this.remoteDb)
            return Promise.resolve()

        return updateDoc(doc(this.remoteDb, key), data)
    }

    _remoteDelete(key) {
        if(!this.remoteDb)
            return Promise.resolve()

        return deleteDoc(doc(this.remoteDb, key))
    }

    _remoteWatching({ provider, id, title, image }) {
        if(!this.remoteDb)
            return Promise.resolve()

        const key = `${provider}#${id}`
        return setDoc(doc(this.remoteDb, key), {
            key,
            provider,
            id,
            title,
            image,
            time: Date.now() 
        }, { merge: true })
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

    _localWatching({ provider, id, title, image }) {
        const key = `${provider}#${id}`
        return this.localDB.history
            .update(key, {
                time: Date.now()
            })
            .then((updated) => {
                if (updated != 0) {
                    return 
                }
                return this.localDB.history.put({
                    key,
                    provider,
                    id,
                    title,
                    image,
                    time: Date.now()
                })
            })
    }
} 

export default new WatchHistoryStore()