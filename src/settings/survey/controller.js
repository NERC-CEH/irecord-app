/** ****************************************************************************
 * Settings Survey controller.
 **************************************************************************** */
import Backbone from 'backbone';
import radio from 'radio';
import Log from 'helpers/log';
import appModel from 'app_model';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';

const API = {
  show() {
    Log('Settings:Survey:Controller: showing.');

    // MAIN
    const mainView = new MainView({
      model: appModel,
    });

    // if exit on selection click
    mainView.on('save', () => {
      const newVal = mainView.getValues();
      appModel.set('gridSquareUnit', newVal);
      appModel.save();
      window.history.back();
    });
    radio.trigger('app:main', mainView);

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Grid Unit',
      }),
    });
    radio.trigger('app:header', headerView);

    // FOOTER
    radio.trigger('app:footer:hide');
  },
};

export { API as default };
