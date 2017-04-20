/** ****************************************************************************
 * Surveys List controller.
 *****************************************************************************/
import Backbone from 'backbone';
import radio from 'radio';
import Log from 'helpers/log';
import MainView from './main_view';
import HeaderView from './header_view';

const API = {
  show() {
    Log('Surveys:List:Controller: showing.');

    // MAIN
    const mainView = new MainView();
    radio.trigger('app:main', mainView);

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Surveys',
      }),
    });
    headerView.on('surveys', () => {
      radio.trigger('samples:list', { replace: true });
    });
    radio.trigger('app:header', headerView);

    // FOOTER
    radio.trigger('app:footer:hide');
  },
};

export { API as default };
