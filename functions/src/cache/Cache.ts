
export default abstract class Cache<Key, Item> {
  getOrCompute(
    key: Key,
    compute: (key: Key) => Promise<Item | null>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isEmpty?: (item: Item | null) => boolean
  ): Promise<Item | null> {
    return compute(key)
  }
  abstract putToCache(key: Key, item: Item): Promise<void>
  abstract get(key: Key): Promise<Item | null>
}