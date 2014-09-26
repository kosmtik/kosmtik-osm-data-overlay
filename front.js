L.K.Map.addInitHook(function () {
    this.whenReady(function () {
        this.settingsForm.addElement(['osmdatalayer', {handler: L.K.Switch, label: 'OSM data layer'}]);
        var urlTemplate = 'http://overpass-api.de/api/interpreter?data=[out:json];(node({s},{w},{n},{e});<;);out;',
            url, bounds,
            pointToLayer = function (feature, latlng) {
                return L.circleMarker(latlng);
            },
            renderRow = function (container, key, value) {
                var tr = L.DomUtil.create('tr', '', container);
                L.DomUtil.create('th', '', tr).innerHTML = key;
                L.DomUtil.create('td', '', tr).innerHTML = value;
            },
            renderTable = function (properties) {
                var table = L.DomUtil.create('table');

                for (var key in properties) {
                    renderRow(table, key, properties[key]);
                }
                return table;
            },
            onEachFeature = function (feature, layer) {
                layer.bindPopup(renderTable(feature.properties));
            };
        this.osmdatalayer = L.geoJson(null, {pointToLayer: pointToLayer, onEachFeature: onEachFeature});
        var fetch = function () {
            this.setState('loading');
            if (L.K.Config.osmdatalayer) {
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
    });
});
