import { observable, action, makeObservable } from 'mobx'
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, child, get, set, query, update, remove, DatabaseReference } from 'firebase/database'
import store from '../utils/storage'
import * as Sentry from '@sentry/react'
import { Playlist } from '../types'

const app = initializeApp({
  apiKey: 'AIzaSyCoQdUA6jN3cWx_yopHDVsC2aIW9Bor2P4',
  authDomain: 'movies-player.firebaseapp.com',
  projectId: 'movies-player',
  databaseURL: 'https://movies-player.firebaseio.com/'
})

const auth = getAuth()
const provider = new GoogleAuthProvider()

const LAST_TIME_SAVE_INTERVAL = 30 * 1000

export interface HistoryItem {
  key: string
  id: string
  provider: string
  time: number
  title: string
  image: string
  audio?: string | null
  fileIndex: number | null
  startTime: number | null
  lastTime?: number | null
}

type Key = Pick<HistoryItem, 'provider' | 'id'>
type LastEpisode = Pick<HistoryItem, 'fileIndex' | 'startTime'>

interface HistoryStorage {
  get: (key: string) => Promise<HistoryItem | null> | HistoryItem | null
  set: (key: string, data: HistoryItem) => Promise<void> | void
  update: (key: string, data: Partial<HistoryItem>) => Promise<void> | void
  delete: (key: string) => Promise<void> | void
  all: () => Promise<HistoryItem[]> | HistoryItem[]
}

class RemoteHistoryStorage implements HistoryStorage {
  remoteDb: DatabaseReference | null = null
  inited = false

  // eslint-disable-next-line require-await
  _getRemoteDB = async (): Promise<DatabaseReference | null> => {
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

  disconnect = (): void => {
    this.remoteDb = null
  }

  reset = (): void => {
    this.remoteDb = null
    this.inited = false
  }

  get = async (key: string): Promise<HistoryItem | null> => {
    const remoteDb = await this._getRemoteDB()

    if (!remoteDb) return null

    const snap = await get(child(remoteDb, this._toRemoteKey(key)))
    return snap.val()
  }

  set = async (key: string, data: HistoryItem): Promise<void> => {
    if (!Object.keys(data).length) return

    const remoteDb = await this._getRemoteDB()

    if (!remoteDb) return

    await set(child(remoteDb, this._toRemoteKey(key)), data)
  }

  update = async (key: string, data: Partial<HistoryItem>): Promise<void> => {
    if (!Object.keys(data).length) return

    const remoteDb = await this._getRemoteDB()

    if (!remoteDb) return

    await update(child(remoteDb, this._toRemoteKey(key)), data)
  }

  delete = async (key: string): Promise<void> => {
    const remoteDb = await this._getRemoteDB()

    if (!remoteDb) return

    await remove(child(remoteDb, this._toRemoteKey(key)))
  }

  all = async (): Promise<HistoryItem[]> => {
    const remoteDb = await this._getRemoteDB()

    if (!remoteDb) return []

    const snap = await get(query(remoteDb))
    const out: HistoryItem[] = []
    snap.forEach((d) => {
      out.push(d.val())
    })
    return out
  }

  _toRemoteKey(key: string): string {
    return key.replace(/[#.]/g, '_')
  }
}
// Going to left this here in case if i wanted to reverer this
// class DexieHistoryDatabase extends Dexie {

//   history!: Dexie.Table<HistoryItem, string> // number = type of the primkey

//   constructor() {
//     super('HistoryDatabase')
//     this.version(3)
//       .stores({
//         history: '&key,provider,id,title,image,time,fileIndex,startTime,audio'
//       })
//   }
// }

// class LocalHistoryStorage implements HistoryStorage { // eslint-disable-line no-unused-vars
//   localDB = new DexieHistoryDatabase()

//   get = async (key: string): Promise<HistoryItem | null> =>
//     await this.localDB.history.get(key) as (HistoryItem | null)

//   set = async (key: string, data: HistoryItem): Promise<void> => {
//     await this.localDB.history.put(data)
//   }

//   update = async (key: string, data: Partial<HistoryItem>): Promise<void> => {
//     await this.localDB.history.update(key, data)
//   }

//   delete = async (key: string): Promise<void> => {
//     await this.localDB.history
//       .where({ key })
//       .delete()
//   }

//   all = async (): Promise<HistoryItem[]> => await this.localDB.history.toArray()
// }

class LocalStoreHistoryStorage implements HistoryStorage {
  get = (key: string): HistoryItem | null => store.get(this._toInternalKey(key))

  set = (key: string, data: HistoryItem): void => {
    try {
      store.set(this._toInternalKey(key), data)
    } catch (e) {
      Sentry.captureException(e)
      console.error(e)
    }
  }

  update = (key: string, data: Partial<HistoryItem>): void => {
    const internalKey = this._toInternalKey(key)
    try {
      store.set(this._toInternalKey(key), { key, ...store.get(internalKey), ...data })
    } catch (e) {
      Sentry.captureException(e)
      console.error(e)
    }
  }

  delete = (key: string): void => {
    store.remove(this._toInternalKey(key))
  }

  all = (): HistoryItem[] => {
    const results: HistoryItem[] = []

    store.each((key: string, val: HistoryItem | undefined) => {
      if (key.startsWith('history:') && val) {
        results.push(val)
      }
    })

    return results
  }

  _toInternalKey = (key: string): string => `history:${key}`

}

class ComposedHistoryStorage implements HistoryStorage {
  initialLoad = false
  updatedKeys = new Set()
  loadHistory: HistoryStorage
  remoteHistory: RemoteHistoryStorage

  constructor(localHistory: HistoryStorage, remoteHistory: RemoteHistoryStorage) {
    this.loadHistory = localHistory
    this.remoteHistory = remoteHistory
  }

  get = async (key: string): Promise<HistoryItem | null> => {
    if (!this.updatedKeys.has(key)) {
      const item = await this.remoteHistory.get(key)
      if (item != null) {
        this.updatedKeys.add(key)
        return this._updateLocalItem(item)
      }
    }

    return await this.loadHistory.get(key)
  }

  set = async (key: string, data: HistoryItem): Promise<void> => {
    await Promise.all([
      this.loadHistory.set(key, data),
      this.remoteHistory.set(key, data)
    ])
  }

  update = async (key: string, data: Partial<HistoryItem>): Promise<void> => {
    await Promise.all([
      this.loadHistory.update(key, data),
      this.remoteHistory.update(key, data)
    ])
  }

  delete = async (key: string): Promise<void> => {
    await Promise.all([
      this.loadHistory.delete(key),
      this.remoteHistory.delete(key)
    ])
    this.updatedKeys.delete(key)
  }

  all = async (): Promise<HistoryItem[]> => {
    if (!this.initialLoad) {
      const items = await this.remoteHistory.all()

      await Promise.all(items.map(this._updateLocalItem))

      items.forEach(({ key }) => this.updatedKeys.add(key))
      this.initialLoad = true
    }

    return this.loadHistory.all()
  }

  _updateLocalItem = async (item: HistoryItem): Promise<HistoryItem> => {
    const localItem = await this.loadHistory.get(item.key)
    if (localItem == null || localItem.time < item.time) {
      await this.loadHistory.set(item.key, { ...localItem, ...item })
      return item
    }
    return localItem
  }

  reset = (): void => {
    this.initialLoad = false
    this.updatedKeys = new Set()
    this.remoteHistory.reset()
  }
}

class WatchHistoryStore {
  @observable insync = false
  @observable history: HistoryItem[] | null = null

  _remoteHistory = new RemoteHistoryStorage()

  _composedHistory = new ComposedHistoryStorage(
    new LocalStoreHistoryStorage(),
    this._remoteHistory
  )

  constructor() {
    makeObservable(this)

    onAuthStateChanged(auth, (user) => {
      this._setInsync(user != null)
    })
  }

  @action.bound _setInsync = (insync: boolean): void => {
    this.insync = insync
  }

  loadHistory = async (): Promise<void> => {
    const items = await this._composedHistory.all()
    this._setHistory(items.sort((a, b) => b.time - a.time))
  }

  @action.bound _setHistory(history: HistoryItem[] | null): void {
    this.history = history
  }

  @action.bound connect(): void {
    signInWithPopup(auth, provider)
      .then(this._composedHistory.reset)
      .then(this.loadHistory)
      .catch((error) => {
        console.error('Fail login', error)
      })
  }

  @action.bound disconnect(): void {
    signOut(auth)
    this._remoteHistory.disconnect()
  }

  watching = async ({ provider, id, title, image }: Playlist): Promise<void> => {
    const key = this._getItemKey({ provider, id })
    const item = await this._composedHistory.get(key)
    await this._composedHistory.set(key, {
      ...item,
      key,
      provider,
      id,
      title,
      image,
      fileIndex: item?.fileIndex || 0,
      startTime: item?.startTime || null,
      time: Date.now()
    })
  }

  deleteFromHistory = async (key: Key): Promise<void> =>
    await this._composedHistory.delete(this._getItemKey(key))

  updateLastFile = async (key: Key, fileIndex: number): Promise<void> =>
    await this._composedHistory.update(this._getItemKey(key), { fileIndex, lastTime: 0, time: Date.now() })

  updateStartTime = async (key: Key, startTime: number): Promise<void> =>
    await this._composedHistory.update(this._getItemKey(key), { startTime })

  _lastTimeSavedTS = 0
  updateLastFilePosition =
    async (key: Key, lastTime: number): Promise<void> => {
      if (Date.now() - this._lastTimeSavedTS < LAST_TIME_SAVE_INTERVAL) return
      this._lastTimeSavedTS = Date.now()
      await this._composedHistory.update(this._getItemKey(key), { lastTime })
    }


  getHistoryItem = async (key: Key): Promise<HistoryItem | null> =>
    await this._composedHistory.get(this._getItemKey(key))


  lastEpisode = async (key: Key): Promise<LastEpisode> => {
    const item = await this._composedHistory.get(this._getItemKey(key))
    const fileIndex = item?.fileIndex ?? 0
    let startTime = item?.lastTime ?? 0
    if (startTime == 0) startTime = item?.startTime ?? 0

    return {
      fileIndex,
      startTime
    }
  }

  updateAudioTrack = async (key: Key, audio: string): Promise<void> =>
    await this._composedHistory.update(this._getItemKey(key), { audio, time: Date.now() })

  audioTrack = async (key: Key): Promise<string | null | undefined> => {
    const item = await this._composedHistory.get(this._getItemKey(key))
    return item?.audio
  }

  _getItemKey({ provider, id }: Key): string {
    return `${provider}#${id}`
  }
}

export default WatchHistoryStore
