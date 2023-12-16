import Cache from './Cache'
import connectToDatabase from '../db/mongo'
import { Collection, Db, Document } from 'mongodb'

const COLLECTION_NAME = process.env.CACHE_TABLE
const expirationTime = parseInt(process.env.CACHE_TTL) * 1000

interface CacheItem<Item> extends Document {
  expired: Date
  result: Item
}

class MongoDBCache<Item> extends Cache<string, Item> {
  private collection: Collection<CacheItem<Item>>

  constructor(name: string, db: Db) {
    super()
    this.collection = db.collection(`${COLLECTION_NAME}-${name}`)
  }

  override async putToCache(key: string, item: Item): Promise<void> {
    const expired = new Date(Date.now() + expirationTime)
    await this.collection.updateOne(
      { _id: key },
      { $set: { result: item, lastModifiedDate: new Date(), expired }, $inc: { hit: 1 } },
      { upsert: true }
    )
  }

  override  async get(key: string): Promise<Item | null> {
    return (await this.getCacheItem(key))?.result ?? null
  }

  private async getCacheItem(key: string): Promise<CacheItem<Item> | null> {
    return (await this.collection.findOneAndUpdate(
      { _id: key },
      { $inc: { hit: 1 } }
    )).value
  }

  // private async extendExpire(key: string): Promise<void> {
  //   const expired = new Date(Date.now() + expirationTime)
  //   await this.collection.updateOne({ _id: key }, { $set: { expired } })
  // }

  override async getOrCompute(
    key: string,
    compute: (key: string) => Promise<Item>,
    isEmpty: (item: Item) => boolean
  ): Promise<Item> {
    const cacheItem = await this.getCacheItem(key)

    if (!cacheItem) {
      const item = await compute(key)

      if (!isEmpty(item)) {
        await this.putToCache(key, item)
      }

      return item
    }

    if (cacheItem.expired.getTime() > Date.now()) {
      return cacheItem.result
    }

    try {
      const item = await compute(key)

      if (!isEmpty(item)) { // if results unavaliable taking from cache
        await this.putToCache(key, item)
        return item
      }

      return cacheItem.result
    } catch (e) {  // if get resource failed exted cahce expiration time 
      return cacheItem.result
    }
  }
}

export default async function <Item>(name: string): Promise<Cache<string, Item>> {
  const db = await connectToDatabase()
  return new MongoDBCache<Item>(name, db)
}