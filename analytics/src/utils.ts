import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { COLORS, PLAYER_URL } from './constants'
import {
  BotEvent,
  BotEventPropValue,
  BucketReducer,
  ChartData,
  Counting,
  Key,
  KeyExtractFn,
  PieData,
  Bucket,
  SegExtractFn,
  Unique,
  ValReducer
} from './types/index'

export const range = (to: number): number[] => Array.from({ length: to }, (_, k) => k + 1)

export const getUserName = ({ firstname, lastname, username }: BotEvent): string =>
  [firstname, lastname].join(' ') + (username ? ' @' + username : '')

export function segmentBucketReducer<Item>(
  segmentExtractor: SegExtractFn<Item>,
  keyExtractor: KeyExtractFn<Item>,
  valueReducer: ValReducer<Item> = (acc: number): number => acc + 1,
  initValue = 0
): BucketReducer<Item, Counting> {
  return ({ acc = {}, chartData = [] }, item) => {
    const seg = segmentExtractor(item)
    const key = keyExtractor(item)

    if (!key) return { acc, chartData }

    if (!acc[seg]) {
      acc[seg] = { seg } as Counting
      chartData.push(acc[seg])
    }

    const segmentBucket = acc[seg]

    if (!segmentBucket[key]) {
      segmentBucket[key] = initValue
    }

    segmentBucket[key] = valueReducer(segmentBucket[key], item)

    return { acc, chartData }
  }
}

export function uniqueBucketReducer<Item>(
  segmentExtractor: SegExtractFn<Item>,
  keyExtractor: KeyExtractFn<Item>
): BucketReducer<Item, Unique> {
  return ({ acc = {}, chartData = [] }, item: Item) => {
    const seg = segmentExtractor(item)
    const key = keyExtractor(item)

    if (!key) return { acc, chartData }

    if (!acc[seg]) {
      acc[seg] = { seg, value: new Set(), count: 0 }
      chartData.push(acc[seg])
    }

    acc[seg].value.add(key)
    acc[seg].count = acc[seg].value.size

    return { acc, chartData }
  }
}

export function bucketReducer<Item>(
  keyExtractor: KeyExtractFn<Item>,
  valueReducer: ValReducer<Item> = (acc): number => acc + 1,
  initValue = 0
): BucketReducer<Item, PieData> {
  return ({ acc = {}, chartData = [] }, item) => {
    const key = keyExtractor(item)
    if (key) {
      if (!acc[key]) {
        acc[key] = { key, value: initValue }
        chartData.push(acc[key])
      }

      acc[key].value = valueReducer(acc[key].value, item)
    }

    return { acc, chartData }
  }
}

export const sortCountingData = (data: ChartData<Counting>): ChartData<Counting> =>
  data.sort((a, b) => b[b.seg] - a[a.seg])

export const sortPieData = (data: ChartData<PieData>): ChartData<PieData> =>
  data.sort((a, b) => b.value - a.value)

export function bucketInitState<T>(): Bucket<T> {
  return { acc: {}, chartData: [] }
}

export const getBucketKeys = ({ acc }: Bucket<PieData>): Key[] => {
  if (!acc)
    return []
  else
    return Object.keys(acc).sort((a, b) => acc[a].value - acc[b].value)
}


export const formChartToPieData = (chartData: ChartData<Counting>, keys: Key[]): PieData[] => keys
  .map((key) => ({
    key,
    value: chartData.reduce((acc, slice) => slice[key], 0)
  }))

export const getEventInputProp = (event: BotEvent): BotEventPropValue | undefined => {
  let propName: keyof BotEvent
  switch (event.type) {
    case 'search': {
      propName = 'query'
      break
    }
    case 'no_results': {
      propName = 'query'
      break
    }
    case 'top': {
      propName = 'query'
      break
    }
    case 'start': {
      propName = 'startPayload'
      break
    }
    default: return
  }

  return {
    name: propName,
    value: event[propName]
  }
}

export const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

export const isTouchDevice = (): boolean => {
  if ('ontouchstart' in document.documentElement) {
    return true
  }

  if (window.matchMedia) {
    const isMobile = window.matchMedia('only screen and (max-width: 570px)')
    return isMobile.matches
  }

  return false
}

export const isPwa = (): boolean => {
  return ['fullscreen', 'standalone', 'minimal-ui'].some(
    (displayMode) => window.matchMedia('(display-mode: ' + displayMode + ')').matches
  )
}

function hash32(str: string): number {
  let i, l, hval = 0x811c9dc5

  for (i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i)
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24)
  }

  return hval >>> 0
}

function hash64(str: string): number {
  const h1 = hash32(str)  // returns 32 bit (as 8 byte hex string)
  return h1 + hash32(h1 + str)  // 64 bit (as 16 byte hex string)
}

export const getColor = (name: string): string => {
  switch (name) {
    case 'search': return COLORS[Math.floor(COLORS.length / 2)]
    case 'start': return COLORS[COLORS.length - 1]
    case 'no_results': return COLORS[0]
    case 'count': return COLORS[0]
    case 'anime': return COLORS[COLORS.length - 1]
    case 'films': return COLORS[0]
    case 'ua': return COLORS[Math.floor(COLORS.length / 2)]
    case 'select_file': return COLORS[0]
    case 'playlist_loaded': return COLORS[0]
    case 'error_playback': return COLORS[COLORS.length - 1]
    case 'error_load': return COLORS[0]
    case 'download_file': return COLORS[5]
    case 'share': return COLORS[8]
    case 'sessions': return COLORS[0]
    case 'mobile': return COLORS[COLORS.length - 1]
    case 'desktop': return COLORS[0]
    case 'tablet': return COLORS[Math.floor(COLORS.length / 2)]
    case 'users': return COLORS[0]
    case 'new_users': return COLORS[COLORS.length - 1]
    default: return COLORS[hash64(name) % COLORS.length]
  }
}

export const isSearchableEvent = ({ type }: BotEvent): boolean => ['search', 'no_results'].includes(type)

export const getBotSearchUrl = ({ bot, query }: BotEvent): string => {
  switch (bot) {
    case 'ua':
      bot = 'UAMoviesBot'
      break
    case 'anime':
      bot = 'anime_tube_bot'
      break
    default:
      bot = 'MoviesBroBot'
  }

  return `https://t.me/${bot}?start=${encodeURIComponent(base64UrlEncode(query!))}`
}

export const getWatchUrl = (provider: string, id: string): string =>
  `${PLAYER_URL}#/watch?provider=${provider}&id=${id}`

export function base64UrlEncode(str: string): string {
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return btoa(
    encodeURIComponent(str)
      .replace(
        /%([0-9A-F]{2})/g,
        (_, p1) => String.fromCharCode(parseInt('0x' + p1)))
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export const toBotEvent = (item: Record<string, AttributeValue>): BotEvent => ({
  bot: item['bot'].S!,
  type: item['type'].S!,
  uid: item['uid'].N!,
  time: parseInt(item['time'].N!),
  date: item['date'].S!,
  month: item['month'].S!,
  username: item['username'].S!,
  firstname: item['firstname']?.S,
  lastname: item['lastname']?.S,
  language_code: item['language_code']?.S,
  startPayload: item['startPayload']?.S,
  query: item['query']?.S,
  providers: item['providers']?.S,
  resultsCount: item['resultsCount']?.N
})
