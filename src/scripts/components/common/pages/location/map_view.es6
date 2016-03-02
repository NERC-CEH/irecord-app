define([
  'marionette',
  'location',
  'JST',
  'app-config',
  'os-leaflet'
], function (Marionette, LocHelp, JST, CONFIG) {

  return Marionette.ItemView.extend({
    template: JST['common/location/map'],

    events: {
      'change #location-name': 'changeName'
    },

    changeName: function (e) {
      this.triggerMethod('location:name:change', $(e.target).val())
    },

    onShow: function () {
      let that = this;

      let currentLocation = this.model.get('recordModel').get('location') || {};
      let mapZoomCoords = [53.7326306,-2.6546124];

      /**
       * 1 gridref digits. (10000m)  -> < 3 map zoom lvl
       * 2 gridref digits. (1000m)   -> 5
       * 3 gridref digits. (100m)    -> 7
       * 4 gridref digits. (10m)     -> 9
       * 5 gridref digits. (1m)      ->
       */
      let mapZoomLevel = 1;

      let markerCoords = [];
      let areaRadius = 0;

      //check if record has location
      if (currentLocation.latitude && currentLocation.longitude) {
        mapZoomCoords = [currentLocation.latitude, currentLocation.longitude];

        //transform location accuracy to map zoom level
        switch (currentLocation.source) {
          case 'map':
            mapZoomLevel = currentLocation.accuracy + 1 || 1;
            //no need to show area as it would be smaller than the marker
            break;
          case 'gps':
            if (currentLocation.accuracy) {
              let digits = Math.log(currentLocation.accuracy) / Math.LN10;
              mapZoomLevel = digits ? 11 - digits * 2 : 10; //max zoom 10 (digits == 0)
              mapZoomLevel = Number((mapZoomLevel).toFixed(0)); //round the float
            } else {
              mapZoomLevel = 1;
            }
            break;
          case 'gridref':
            //todo area
            mapZoomLevel = currentLocation.accuracy + 1;
            //
            //// define rectangle geographical bounds
            //var bounds = [[54.559322, -5.767822], [56.1210604, -3.021240]];
            //
            //// create an orange rectangle
            //L.rectangle(bounds, {color: "#ff7800", weight: 1})
            break;
          default:
            mapZoomLevel = L.OSOpenSpace.RESOLUTIONS.length - 3
        }

        if (mapZoomLevel > 10) {
          mapZoomLevel = 10;
        }
        markerCoords = mapZoomCoords;
      }

      let mapHeight = $(document).height() - 47 - (44 + 38.5);

      let container = this.$el.find('#map')[0];
      $(container).height(mapHeight);

      var openspaceLayer;

      /* L.Map with OS options */
      let map = new L.Map(container, {
        crs: L.OSOpenSpace.getCRS(),
        continuousWorld: false,
        worldCopyJump: false,
        minZoom: 0,
        maxZoom: L.OSOpenSpace.RESOLUTIONS.length - 1
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

      /* add some event callbacks */
      var myIcon = L.divIcon({className: 'icon icon-plus map-marker'});
      let marker = L.marker(markerCoords, {icon: myIcon});

      //let area = L.circle(markerCoords, areaRadius, {
      //  color: 'red',
      //  fillColor: '#f03',
      //  fillOpacity: 0.5
      //});

      let markerAdded = false;
      if (markerCoords.length) {
        marker.addTo(map);
        //area.addTo(map);
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

        location.gridref = LocHelp.coord2grid(location, location.accuracy);

        //trigger won't work to bubble up
        that.triggerMethod('location:select:map', location);
      }

      map.on('click', onMapClick);
    },

    serializeData: function () {
      let location = this.model.get('recordModel').get('location') || {};

      return {
        name: location.name
      }
    }
  });
});