const Provider = require("./Provider");
const superagent = require("superagent");

const wakanimPrefix = "https://wakanim.xyz/cdn/".length;

class NekomoriProvider extends Provider {
  constructor() {
    super("nekomori");
  }

  async search(query) {
    const { baseUrl, postersCDNUrl, timeout, realip } = this.config;

    query = this._prepareQuery(query);

    try {
      const ret = await superagent
        .get(
          `${baseUrl}/arts?search=${encodeURIComponent(
            query
          )}&page=1&perpage=20`
        )
        .connect(realip)
        .timeout(timeout);

      return ret.body.page.map(({ id, name }) => ({
        provider: this.name,
        id,
        name: name.ru || name.en,
        image: `${postersCDNUrl}/${id}.jpg`,
      }));
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async getInfo(artId) {
    const { baseUrl, timeout, postersCDNUrl, realip } = this.config

    let ret = await superagent
        .get(`${baseUrl}/arts/${artId}`)
        .connect(realip)
        .timeout(timeout)

    const title = ret.body.name.ru
    const totalEp = ret.body.ep_total

    ret = await superagent
      .get(`${baseUrl}/external/kartinka?artId=${artId}`)
      .connect(realip)
      .timeout(timeout);

    const seed = ret.text.substring(wakanimPrefix)

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

    const ret = await superagent
      .get(`https://wakanim.xyz/cdn/list?page=${episode}`)
      .set({ seed });

    const lookupConfig = (src) => {
      const key = configKeys.find((key) => src.includes(key));
      return sourceConfig[key];
    };

    const file = {
      id: parseInt(episode),
      name: `Episode ${episode}`,
      urls: [],
    };

    console.log(ret.body)

    ret.body.forEach(({ authors, src }) => {
      const config = lookupConfig(src);
      if (!config) return;

      const { extractor } = config

      const audio = authors[0].name
      file.urls = file.urls.concat([{ audio, url: src, extractor: { type: extractor }}])
    });

    return file
  }
}

module.exports = NekomoriProvider;
