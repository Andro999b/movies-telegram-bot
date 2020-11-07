import { COLLECTION_NAME, connectToDatabase } from './db/mongo'

module.exports.handler = async ({ provider, resultId }) => {
    if(!provider) throw new Error('provider required')

    const client = await connectToDatabase()

    const collection = client.collection(COLLECTION_NAME)
    if(resultId) {
        return collection.deleteOne({ _id: `${provider}:${resultId}` }).then(() => ({ status: 'OK'}))
    } else {
        return collection.deleteMany({ 'result.provider': provider }).then(() => ({ status: 'OK'}))
    }
}