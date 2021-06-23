const Provider = require("./Provider");
const invokeCFBypass = require("../utils/invokeCFBypass");

const wakanimPrefix = "https://wakanim.xyz/cdn/index.php?file=".length;

class NekomoriProvider extends Provider {
  constructor() {
    super("nekomori")
  }

  async search(query) {
    const { baseUrl, postersCDNUrl } = this.config;

    query = this._prepareQuery(query);

    try {
      const ret = await invokeCFBypass(`${baseUrl}/arts?search=${encodeURIComponent(query)}&page=1&perpage=20`)

      return JSON.parse(ret.body).page.map(({ id, name }) => ({
        provider: this.name,
        id,
        name: name.ru || name.en,
        image: `${postersCDNUrl}/${id}.jpg`,
      }));
    } catch (err) {
      console.log(err)
      return []
    }
  }

  async getInfo(artId) {
    const { baseUrl, postersCDNUrl } = this.config

    let ret = await invokeCFBypass(`${baseUrl}/arts/${artId}`)
    const body = JSON.parse(ret.body)
    
    const title = body.name.ru
    const totalEp = body.ep_total

    ret = await invokeCFBypass(`${baseUrl}/external/kartinka?artId=${artId}`)

    const seed = ret.body.substring(wakanimPrefix)

    return {
      id: artId,
      title,
      provider: this.name,
      image: `${postersCDNUrl}/${artId}.jpg`,
      files: Array(totalEp)
        .fill()
        .map((_, id) => ({ 
            id,
            name: `Episod ${id + 1}`,
            asyncSource: `${seed}:${id + 1}`
        }))
    };
  }

  async getSource(resultsId, sourceId) {
    const { sourceConfig } = this.config;
    const configKeys = Object.keys(sourceConfig);

    const [seed, episode] = sourceId.split(":");

    const ret = await invokeCFBypass(`https://wakanim.xyz/cdn/list?page=${episode}`, "get", { seed })   

    const lookupConfig = (src) => {
      const key = configKeys.find((key) => src.includes(key))
      return sourceConfig[key]
    }

    const file = {
      id: parseInt(episode),
      name: `Episode ${episode}`,
      urls: [],
    }

    ret.body.forEach(({ authors, src }) => {
      const config = lookupConfig(src)
      if (!config) return;

      const { extractor } = config

      const audio = authors[0].name
      file.urls = file.urls.concat([{ audio, url: src, extractor: { type: extractor }}])
    })

    return file
  }
}

module.exports = NekomoriProvider;
