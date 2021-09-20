import parsePlayerJSFile from "../parsePlayerJSFile"

function getRezkaSource({ dataId, translatorId, season, episode }) {
  let formData

  if(season) {
    formData = new FormData()
    formData.append("id", dataId)
    formData.append("translator_id", translatorId)
    formData.append("season", season)
    formData.append("episode", episode)
    formData.append("action", "get_stream")
  } else {
    formData = new FormData()
    formData.append("id", dataId)
    formData.append("translator_id", translatorId)
    formData.append("action", "get_movie")
  }

  return fetch(`https://corsproxy.movies-player.workers.dev/?https://rezka.ag/ajax/get_cdn_series/?t=${Date.now()}`, {
      method: "POST",
      body: formData
    })
    .then((res) => res.json())
    .then((json) => ({
        urls: parsePlayerJSFile(json.url)
      })
    )
}

export default {
  rezka: getRezkaSource
}