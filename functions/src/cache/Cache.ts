
export default abstract class Cache<Key, Item> {
  private defaultIsEmpty = (item: Item | null): boolean => item == null
  getOrCompute(
    key: Key,
    compute: (key: Key) => Promise<Item | null>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isEmpty: (item: Item | null) => boolean = this.defaultIsEmpty
  ): Promise<Item | null> {
    return compute(key)
  }
  abstract putToCache(key: Key, item: Item): Promise<void>
  abstract get(key: Key): Promise<Item | null>
}