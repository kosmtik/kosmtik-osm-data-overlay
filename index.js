exports.Plugin = function (config) {
    config.addJS('/node_modules/kosmtik-osm-data-overlay/front.js');
    config.addJS('/node_modules/osmtogeojson/osmtogeojson.js');
};
