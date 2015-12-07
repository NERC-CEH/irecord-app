define([
  'app',
  'common/tabs_layout',
  './header_view',
  './gps_view',
  './map_view',
  './grid_ref_view',
  './past_view'
], function (app, TabsLayout, HeaderView, GpsView, MapView, GridRefView, PastView) {
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
          },
          {
            id: 'grid-ref',
            title: 'Grid Ref',
            ContentView: GridRefView
          },
          {
            id: 'past',
            title: 'Past',
            ContentView: PastView
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