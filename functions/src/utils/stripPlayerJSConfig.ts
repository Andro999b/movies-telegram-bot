import { PlayerJSConfig } from '../types/index'
import JSON5 from 'json5'

export default (script: string): PlayerJSConfig | null => {
  const parts = script.match(/new Playerjs\(([^)]+)\);/)

  if (parts) {
    const config = JSON5.parse(parts[1])

    return config as PlayerJSConfig
  }

  return null
}