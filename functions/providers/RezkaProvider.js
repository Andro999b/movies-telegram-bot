const Provider = require("./Provider");
const $ = require("cheerio");
const urlencode = require("urlencode");

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
    if(matches == null) return []

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
          asyncSource: {
            dataId,
            season,
            episode,
            translatorId
          },
          name: season
            ? `Season ${season}/Episode ${episode}`
            : `Episode ${episode}`,
        };
      });
  }

  _getMovieFile(playerScript) {
    const matches = playerScript.match(/initCDNMoviesEvents\((\d+), (\d+)/);

    if(matches == null) return []

    const dataId = matches[1]
    const translatorId = matches[2]

    return [
      {
        id: 0,
        asyncSource: {
          dataId,
          translatorId
        }
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

  getSearchUrl(query) {
    return `${this.config.searchUrl}&q=${encodeURIComponent(query)}`;
  }
}

module.exports = RezkaProvider;
