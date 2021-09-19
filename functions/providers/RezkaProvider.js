const Provider = require("./Provider");
const $ = require("cheerio");
const urlencode = require("urlencode");
const request = require("superagent");
const { base64encode, base64decode } = require("../utils/base64");
const { extractStringPropery } = require("../utils/extractScriptVariable");
const parsePlayerJSFile = require("../utils/parsePlayerJSFile");

class RezkaProvider extends Provider {
  constructor() {
    super("rezka", {
      scope: ".b-content__inline_item",
      selectors: {
        id: { transform: ($el) => urlencode($el.attr("data-url")) },
        name: ".b-content__inline_item-link > a",
        image: {
          selector: ".b-content__inline_item-cover > a > img",
          transform: ($el) => this._absoluteUrl($el.attr("src")),
        },
      },
      detailsScope: ".b-post",
      detailsSelectors: {
        title: ".b-post__title h1",
        image: {
          selector: ".b-sidecover > a >  img",
          transform: ($el) => this._absoluteUrl($el.attr("src")),
        },
        files: {
          transform: async ($scope, $root) => {
            const scripts = this._extractPlayerConfigScript($root);

            if (scripts.length == 0) return [];

            const files = this._tryExtractTVShowFiles($scope, scripts[0]);

            if (files.length > 0) {
                return [].concat(...files).map((item, index) => ({
                    id: index,
                    ...item,
                }));
            } else {
                return this._getMovieFile(scripts[0])
            }
          },
        },
      },
    });
  }

  _tryExtractTVShowFiles($scope, playerScript) {
    const matches = playerScript.match(/initCDNSeriesEvents\(\d+, (\d+)/);
    const translatorId = matches[1]

    return $scope
      .find("#simple-episodes-tabs .b-simple_episode__item")
      .toArray()
      .map((el) => {
        const $el = $(el);
        const dataId = $el.attr("data-id");
        const season = $el.attr("data-season_id");
        const episode = $el.attr("data-episode_id");

        return {
          asyncSource: base64encode(
            JSON.stringify({
              dataId,
              season,
              episode,
              translatorId
            })
          ),
          name: season
            ? `Season ${season}/Episode ${episode}`
            : `Episode ${episode}`,
        };
      });
  }

  _getMovieFile(playerScript) {
    const streams = extractStringPropery(playerScript, "streams");

    return [
      {
        id: 0,
        urls: parsePlayerJSFile(streams),
      },
    ];
  }

  _extractPlayerConfigScript($root) {
    const scripts = $root
      .find("body > script")
      .toArray()
      .map((el) => el.children)
      .filter((el) => el && el.length > 0)
      .map((el) => el[0].data);

    return scripts.filter((el) =>
      el.startsWith(" $(function () { sof.tv.initCDN")
    );
  }

  async getSource(resultsId, sourceId) {
    const { baseUrl, headers, timeout } = this.config;

    const { dataId, translatorId, season, episode } = JSON.parse(base64decode(sourceId));

    console.log(`id=${dataId}&translator_id=${translatorId}&season=${season}&episode=${episode}&action=get_stream`)

    const res = await request
      .post(`${baseUrl}/ajax/get_cdn_series/?t=${Date.now()}`)
      .send(`id=${dataId}&translator_id=${translatorId}&season=${season}&episode=${episode}&action=get_stream`)
      .timeout(timeout)
      .set({
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded'
      });


    const body = JSON.parse(res.text)

    return { urls: parsePlayerJSFile(body.url) };
  }

  getSearchUrl(query) {
    return `${this.config.searchUrl}&q=${encodeURIComponent(query)}`;
  }
}

module.exports = RezkaProvider;
