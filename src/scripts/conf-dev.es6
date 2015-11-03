/******************************************************************************
 * Main app configuration file.
 *****************************************************************************/
define(['morel', 'helpers/log'], function () {
  app.VERSION = '{APP_VER}'; //replaced on build
  app.NAME = '{APP_NAME}'; //replaced on build

  app.CONF = {
    GPS_ACCURACY_LIMIT: 100,

    GA: {
      STATUS: false
    },

    MAP: {
      zoom: 5,
      zoomControl: true,
      zoomControlOptions: {
        style: 2,
        position: 5
      },
      panControl: false,
      linksControl: false,
      streetViewControl: false,
      overviewMapControl: false,
      scaleControl: false,
      rotateControl: false,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: 1,
        position: 7
      },
      styles: [
        {
          "featureType": "landscape",
          "stylers": [
            {"hue": "#FFA800"},
            {"saturation": 0},
            {"lightness": 0},
            {"gamma": 1}
          ]
        },
        {
          "featureType": "road.highway",
          "stylers": [
            {"hue": "#53FF00"},
            {"saturation": -73},
            {"lightness": 40},
            {"gamma": 1}
          ]
        },
        {
          "featureType": "road.arterial",
          "stylers": [
            {"hue": "#FBFF00"},
            {"saturation": 0},
            {"lightness": 0},
            {"gamma": 1}
          ]
        },
        {
          "featureType": "road.local",
          "stylers": [
            {"hue": "#00FFFD"},
            {"saturation": 0},
            {"lightness": 30},
            {"gamma": 1}
          ]
        },
        {
          "featureType": "water",
          "stylers": [
            {"saturation": 43},
            {"lightness": -11},
            {"hue": "#0088ff"}
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels",
          "stylers": [
            { "visibility": "off" }
          ]
        }
      ]
    }
  };

  //logging
  log.CONF = {
    STATE: log.DEBUG
  };

  //morel configuration
  app.CONF.morel = {
    url: 'http://192.171.199.230/irecord7/mobile/submit',
    appname: "test",
    appsecret: "mytest",
    website_id: 23,
    survey_id: 258,
    Storage: morel.DatabaseStorage
  };

  $.extend(true, morel.Sample.keys, {
    name: {
      id: 6
    },
    surname: {
      id: 7
    },
    email: {
      id: 8
    },
    location_accuracy: {
      id: 282
    },
    location_name: {
      id: 274
    }
  });

  $.extend(true, morel.Occurrence.keys, {
    number: {
      id: 383,
      values: {
        '1': 4774,
        '2-10': 4775,
        '11-100': 4776,
        '101-1000': 4777,
        '1000+': 4778,
        'Present': 4779 //default
      }
    }
  });
});