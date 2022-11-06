import Cache from './Cache'
import connectToDatabase from '../db/mongo'
import { Collection, Db, Document } from 'mongodb'

const COLLECTION_NAME = process.env.CACHE_TABLE
const expirationTime = parseInt(process.env.CACHE_TTL ?? '3600') * 1000

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

  private async extendExpire(key: string): Promise<void> {
    const expired = new Date(Date.now() + expirationTime)
    await this.collection.updateOne({ _id: key }, { $set: { expired } })
  }

  override async getOrCompute(
    key: string,
    compute: (key: string) => Promise<Item>,
    isEmpty?: (item: Item) => boolean
  ): Promise<Item> {
    let item: Item
    const cacheItem = await this.getCacheItem(key)

    if (cacheItem) {
      if (cacheItem.expired.getTime() < Date.now()) {
        try {
          item = await compute(key)

          if (item != null && (isEmpty === undefined || !isEmpty(item))) { // if results unavaliable taking from cache
            await this.putToCache(key, item)
          } else {
            item = cacheItem.result
            await this.extendExpire(key)
          }
        } catch (e) {  // if get resource failed exted cahce expiration time 
          item = cacheItem.result
          await this.extendExpire(key)
        }
      } else {
        item = cacheItem.result
      }
    } else {
      item = await compute(key)
      if (!isEmpty || !isEmpty(item)) {
        await this.putToCache(key, item)
      }
    }

    return item
  }
}

export default async function <Item>(name: string): Promise<Cache<string, Item>> {
  const db = await connectToDatabase()
  return new MongoDBCache<Item>(name, db)
}