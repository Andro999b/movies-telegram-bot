export interface PlayerJSItem {
  id?: string
  file?: string
  title?: string
  comment?: string
  folder?: PlayerJSItem[]
  playlist?: PlayerJSItem[]
}

export type PlayerJSPlaylist = string | PlayerJSItem[]
export interface PlayerJSConfig {
  file: PlayerJSPlaylist
}