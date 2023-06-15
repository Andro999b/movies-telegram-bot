import { PlayerJSConfig } from '../types/index'
import JSON5 from 'json5'

const PLAYER_JS_REGEXP = /new Playerjs\(([^)]+)\);/
export default (script: string): PlayerJSConfig | null => {
  const parts = script.match(PLAYER_JS_REGEXP)

  if (parts) {
    const config = JSON5.parse(parts[1])

    return config as PlayerJSConfig
  }

  return null
}