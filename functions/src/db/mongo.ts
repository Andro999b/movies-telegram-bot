import { Db, MongoClient } from 'mongodb'
const MONGODB_URI = process.env.MONGODB_URI

let cachedDb: Db | null = null

async function connectToDatabase(): Promise<Db> {
  if (!cachedDb) {
    const client = await MongoClient.connect(MONGODB_URI!)
    cachedDb = client.db('test')
  }

  return cachedDb
}


export default connectToDatabase