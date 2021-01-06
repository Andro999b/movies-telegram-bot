import { Dexie } from 'dexie'

class WatchHistoryStore {
    constructor() {
        this.db = new Dexie('HistoryDatabase')
        this.db.version(1).stores({
            history: '&key,provider,id,title,image,time'
        })
    }

    watching = ({ id, provider, title, image }) => {
        this.db.history.put({
            key: `${provider}#${id}`,
            provider,
            id,
            title,
            image,
            time: Date.now()
        })
    }

    delete = (key) => {
        this.db.history
            .where({ key })
            .delete()
    }

    getHistory = () => {
        return this.db.history
            .orderBy('time')
            .reverse()
    }  
} 

export default new WatchHistoryStore()