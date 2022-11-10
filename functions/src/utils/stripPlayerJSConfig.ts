import { PlayerJSConfig } from '../types/index.js'

export default (script: string): PlayerJSConfig | null => {
  const parts = script.match(/new Playerjs\(([^)]+)\);/)

  if (parts) {
    let config: unknown

    // eval(`config = ${parts[1]}`)
    return config as PlayerJSConfig
  }

  return null
}