define([
  'app',
  'common/tabs_layout',
  './header_view',
  './gps_view',
  './map_view'
], function (app, TabsLayout, HeaderView, GpsView, MapView) {
  let API = {
    show: function (){
      let mainView = new TabsLayout({
        tabs: [
          {
            id: 'gps',
            title: 'GPS',
            ContentView: GpsView
          },
          {
            id: 'map',
            title: 'Map',
            ContentView: MapView
          }
        ]
      });
      app.regions.main.show(mainView);

      let headerView = new HeaderView();
      app.regions.header.show(headerView);
    }
  };

  return API;
});