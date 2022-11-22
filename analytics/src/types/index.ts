export type Key = string
export type Seg = string

export type ExtractFn<Item, Result> = (Item: Item) => Result
export type KeyExtractFn<Item> = ExtractFn<Item, Key>
export type SegExtractFn<Item> = ExtractFn<Item, Seg>
export type ValReducer<Item, Value = number> = (acc: Value, item: Item) => Value

export interface Unique {
  seg: Seg
  value: Set<Key>
  count: number
}

export type Counting = { seg: Seg } & { [key: Key]: number }

export type ChartData<Bucket = object> = Bucket[]

export interface Bucket<T> {
  acc: Record<Seg, T>
  chartData: ChartData<T>
}

export type BucketReducer<Item, R> = (acc: Bucket<R>, item: Item) => Bucket<R>

export interface PieData {
  key: Key,
  value: number
}

export interface BotEvent {
  bot: string
  type: string
  uid: string
  time: number
  date: string
  month: string
  username: string
  firstname?: string
  lastname?: string
  query?: string
  title?: string
  language_code?: string
  startPayload?: string
}

export interface BotEventWithFilter extends BotEvent {
  filter: string
}

export type BotEventKeys = keyof BotEvent

export interface BotEventPropValue {
  name: keyof BotEvent
  value: string | undefined
}

export interface MongoStats {
  providers: MongoStatsCount[]
  providersHits: MongoStatsCount[]
  hits: MongoStatsHits[]
  recient: MongoStatsRecient[]
}

export interface MongoStatsCount {
  _id: string
  count: number
}

export interface MongoStatsPlaylistResult {
  _id: string
  result: MongoStatsPlaylist
}


export interface MongoStatsHits extends MongoStatsPlaylistResult {
  hit: number
}

export interface MongoStatsRecient extends MongoStatsPlaylistResult {
  lastModifiedDate: string
}

export interface MongoStatsPlaylist {
  title: string
  provider: string
}

export type GAKeys = 'events' | 'users' | 'new_users' | 'devices' | 'sessions' | 'countries' | 'labels'

export interface GAStatistic {
  segment: string
  results: {
    key: GAKeys
    result: string[]
  }[]
}
