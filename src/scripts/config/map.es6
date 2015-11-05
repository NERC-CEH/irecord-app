define([], function () {
  let MAP = {
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
          {"visibility": "off"}
        ]
      }
    ]
  };

  return MAP;
});