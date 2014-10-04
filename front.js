L.K.Map.addInitHook(function () {
    this.whenReady(function () {
        this.settingsForm.addElement(['osmdatalayer', {handler: L.K.Switch, label: 'OSM data layer'}]);
        var urlTemplate = 'http://overpass-api.de/api/interpreter?data=[out:json];(node({s},{w},{n},{e});<;);out;',
            url, bounds,
            pointToLayer = function (feature, latlng) {
                return L.circleMarker(latlng);
            },
            onEachFeature = function (feature, layer) {
                layer.bindPopup(L.K.Util.renderPropertiesTable(feature.properties));
            };
        this.osmdatalayer = L.geoJson(null, {pointToLayer: pointToLayer, onEachFeature: onEachFeature});
        var fetch = function () {
            if (L.K.Config.osmdatalayer) {
                this.setState('loading');
                bounds = this.getBounds();
                url = L.Util.template(urlTemplate, {
                    e: bounds.getEast(),
                    s: bounds.getSouth(),
                    w: bounds.getWest(),
                    n: bounds.getNorth()
                });
                L.K.Xhr.get(url, {
                    callback: function (status, data) {
                        if (status === 200 && data) {
                            this.osmdatalayer.clearLayers();
                            this.osmdatalayer.addData(osmtogeojson(JSON.parse(data), {flatProperties: true}));
                            this.osmdatalayer.addTo(this);
                        }
                        this.unsetState('loading');
                    },
                    context: this
                });
            } else {
                this.removeLayer(this.osmdatalayer);
            }
        };
        this.on('settings:synced', function (e) {
            if (e.field === 'osmdatalayer') L.bind(fetch, this)();
        }, this);
        this.on('moveend', fetch);
        var shortcutCallback = function () {
            L.K.Config.osmdatalayer = !L.K.Config.osmdatalayer;
            L.bind(fetch, this)();
            this.settingsForm.fetchAll();
        };
        this.shortcuts.add({
            keyCode: L.K.Keys.D,
            ctrlKey: true,
            altKey: true,
            callback: shortcutCallback,
            context: this,
            description: 'Toggle overlay'
        });
    });
});
