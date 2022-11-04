import PlayerStore from './player-store'
import NotificationStore from './notifications-store'
import WatchHistoryStore from './watch-history-store'
import PlaylistStore from './playlist-store'

export const notificationStore = new NotificationStore()
export const playerStore = new PlayerStore()
export const watchHistoryStore = new WatchHistoryStore()
export const playlistStore = new PlaylistStore()
