/*******************************************************************************
 * Activities List controller.
 ******************************************************************************/
import $ from 'jquery';
import Backbone from 'backbone';
import Log from '../../../helpers/log';
import App from '../../../app';
import MainView from './main_view';
import HeaderView from '../../common/header_view';
import appModel from '../../common/app_model';
import userModel from '../../common/user_model';
import CONFIG from 'config'; // Replaced with alias
import LoaderView from '../../common/loader_view';

var ActivityRecord = Backbone.Model.extend({
  defaults: {
    id: null,
    title: '',
    description: '',
    type: '',
    initiallyChecked: false
  }
});

const API = {
  show() {
    Log('Activities:Controller: showing');
    const loaderView = new LoaderView();
    App.regions.main.show(loaderView);

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Activities',
      }),
    });
    App.regions.header.show(headerView);

    // FOOTER
    App.regions.footer.hide().empty();

    // MAIN
    /**
     * Method for loading the activities into the view, either from the warehouse
     * or the copy cached in the app model.
     * @param activitiesData Array of activity objects with id, description and title.
     */
    var showActivities = function(activitiesData) {
      var activitiesList = new Backbone.Collection(),
        currentGroupId = appModel.get('groupId');
      const mainView = new MainView({
        collection: activitiesList
      });
      activitiesList.add(new ActivityRecord({
        title:"iRecord",
        description:"Submit records to iRecord which are not part of any specific activity",
        initiallyChecked: !currentGroupId
      }));
      $.each(activitiesData, function() {
        this.initiallyChecked = currentGroupId===this.id;
        activitiesList.add(new ActivityRecord(this));
      });
      App.regions.main.show(mainView);
      let onExit = () => {
        Log('Activities:List:Controller: exiting');
        let groupId = mainView.getGroupId();
        API.save(groupId);
      };
      // if exit on selection click
      mainView.on('save', onExit);
      headerView.onExit = onExit;
    };

    // Don't reload the activities if the user has already loaded them
    var activitiesData = appModel.get('activities');
    if (activitiesData===null) {
      var data = {
        "report": "library/groups/groups_for_page.xml",
        "currentUser": 3, // userModel.,
        "path": "enter-record-list",
        "email": userModel.email,
        "appname": CONFIG.morel.manager.appname,
        "appsecret": CONFIG.morel.manager.appsecret
      };

      $.ajax({
        url: CONFIG.report.url,
        type: 'POST',
        data: data,
        dataType: 'JSON',
        timeout: CONFIG.report.timeout,
        success(receivedData) {
          showActivities(receivedData);
          appModel.set('activities', receivedData);
          appModel.save();
        },
        error(xhr, ajaxOptions, thrownError) {
          Log('Activities load failed');
        },
      });
    } else {
      showActivities(activitiesData);
    }
  },

  save: function (groupId) {
    appModel.set('groupId', groupId);
    appModel.save(null, {
      success: () => {
        window.history.back();
      }
    });

  }
};

export { API as default };
