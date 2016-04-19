/*******************************************************************************
 * Activities List controller.
 ******************************************************************************/
import Backbone from 'backbone';
import Log from '../../../helpers/log';
import App from '../../../app';
import MainView from './main_view';
import HeaderView from '../../common/header_view';
import appModel from '../../common/app_model';

var ActivityRecord = Backbone.Model.extend({
  defaults: {
    title: 'My activity default'
  }
});

const API = {
  show() {
    Log('Activities:Controller: showing');

    // MAIN
    var activitiesList = new Backbone.Collection();
    const mainView = new MainView({
      collection: activitiesList,
      appModel
    });
    activitiesList.add(new ActivityRecord({title:"iRecord"}));
    activitiesList.add(new ActivityRecord({title:"Garden Bioblitz 2016"}));
    App.regions.main.show(mainView);

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Activities',
      }),
    });
    App.regions.header.show(headerView);

    // FOOTER
    App.regions.footer.hide().empty();
  }
};

export { API as default };
