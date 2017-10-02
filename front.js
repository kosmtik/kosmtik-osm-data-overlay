/*global osmtogeojson*/
L.K.Map.addInitHook(function () {
    this.whenReady(function () {
        this.settingsForm.addElement(['osmdatalayer', {handler: L.K.Switch, label: 'OSM data layer (alt-ctrl-D)'}]);
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
            if (e.helper.field === 'osmdatalayer') L.bind(fetch, this)();
        }, this);
        this.on('moveend', fetch);
        var commandCallback = function () {
            L.K.Config.osmdatalayer = !L.K.Config.osmdatalayer;
            L.bind(fetch, this)();
            this.settingsForm.fetchAll();
        };
        this.commands.add({
            keyCode: L.K.Keys.D,
            ctrlKey: true,
            altKey: true,
            callback: commandCallback,
            context: this,
            name: 'OSM data layer: toggle'
        });
        var openInOSM = function () {
            window.open(`https://openstreetmap.org#map=${this.getZoom()}/${this.getCenter().lat}/${this.getCenter().lng}`, '_blank');
        };
        this.commands.add({
            keyCode: L.K.Keys.O,
            altKey: true,
            ctrlKey: true,
            callback: openInOSM,
            context: this,
            name: 'OSM: open in openstreetmap.org'
        });
    });
});
