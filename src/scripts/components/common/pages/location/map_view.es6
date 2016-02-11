define([
  'marionette',
  'JST',
  'app-config',
  'os-leaflet'
], function (Marionette, JST, CONFIG) {

  return Marionette.ItemView.extend({
    template: JST['common/location/map'],

    onShow: function () {
      let that = this;

      let currentLocation = this.model.get('recordModel').get('location') || {};
      let mapZoomCoords = [53.7326306,-2.6546124];
      let mapZoomLevel = 1;
      let markerCoords = [];

      if (currentLocation.latitude && currentLocation.longitude) {
        mapZoomCoords = [currentLocation.latitude, currentLocation.longitude];
        if (currentLocation.source === 'map') {
          mapZoomLevel = currentLocation.accuracy || 1;
        } else {
          mapZoomLevel = L.OSOpenSpace.RESOLUTIONS.length - 3
        }
        markerCoords = mapZoomCoords;
      }

      let mapHeight = $(document).height() - $('#map-message').height() - (44 + 38.5);
      mapHeight = mapHeight * 0.95;

      let container = this.$el.find('#map')[0];
      $(container).height(mapHeight);

      var openspaceLayer;

      /* L.Map with OS options */
      let map = new L.Map(container, {
        crs: L.OSOpenSpace.getCRS(),
        continuousWorld: false,
        worldCopyJump: false,
        minZoom: 0,
        maxZoom: L.OSOpenSpace.RESOLUTIONS.length - 1,
      });

      /* New L.TileLayer.OSOpenSpace with API Key */
      let API_KEY = CONFIG.map.API_KEY;
      openspaceLayer = L.tileLayer.OSOpenSpace(API_KEY);

      openspaceLayer.on('tileerror', function (tile) {
        let index = 0;
        let result = tile.tile.src.match(/missingTileString=(\d+)/i);
        if (result){
          index = Number.parseInt(result[1]);
          index++;

          //don't do it more than few times
          if (index < 4) {
            tile.tile.src = tile.tile.src.replace(/missingTileString=(\d+)/i, '&missingTileString=' + index);
          }
        } else {
          if (index === 0) {
            tile.tile.src = tile.tile.src + '&missingTileString=' + index;
          }
        }
      });

      map.addLayer(openspaceLayer);
      map.setView(mapZoomCoords, mapZoomLevel);

      /* add some ui elems to the map */
      L.control.scale().addTo(map);

      //L.circle([51.508, -0.11], 500, {
      //  color: 'red',
      //  fillColor: '#f03',
      //  fillOpacity: 0.5
      //}).addTo(map).bindPopup("I am a circle.");


      /* add some event callbacks */
      var myIcon = L.divIcon({className: 'icon icon-plus map-marker'});
      let marker = L.marker(markerCoords, {icon: myIcon});

      let markerAdded = false;
      if (markerCoords.length) {
        marker.addTo(map);
        markerAdded = true;
      }

      function onMapClick(e) {
        marker.setLatLng(e.latlng);
        if (!markerAdded) {
          marker.addTo(map);
          markerAdded = true;
        }

        let location = {
          latitude: Number.parseFloat(e.latlng.lat.toFixed(7)),
          longitude: Number.parseFloat(e.latlng.lng.toFixed(7)),
          source: 'map',
          accuracy: map.getZoom()
        };

        //trigger won't work to bubble up
        that.triggerMethod('location:select:map', location);
      }

      map.on('click', onMapClick);
    }
  });
});