/*******************************************************************************
 * Activities List controller.
 ******************************************************************************/
import $ from 'jquery';
import Backbone from 'backbone';
import Log from '../../../helpers/log';
import App from '../../../app';
import MainView from './main_view';
import HeaderView from '../../common/header_view';
import RefreshView from './refresh_view';
import appModel from '../../common/app_model';
import userModel from '../../common/user_model';
import CONFIG from 'config'; // Replaced with alias
import LoaderView from '../../common/loader_view';

/**
 * Model to hold details of an activity (group entity)
 */
var ActivityRecord = Backbone.Model.extend({
  defaults: {
    id: null,
    title: '',
    description: '',
    type: '',
    checked: false
  }
});

const API = {
  activitiesList: new Backbone.Collection(),

  mainView: null,

  /**
   * Method for loading the activities into the view, either from the warehouse
   * or the copy cached in the app model.
   * @param activitiesData Array of activity objects with id, description and title.
   */
  showActivities: function(activitiesData) {
    var currentGroupId = appModel.get('groupId');
    API.activitiesList.reset();
    API.activitiesList.add(new ActivityRecord({
      title:"iRecord",
      description:"Submit records to iRecord which are not part of any specific activity",
      checked: !currentGroupId
    }));
    $.each(activitiesData, function() {
      this.checked = currentGroupId===this.id;
      API.activitiesList.add(new ActivityRecord(this));
    });
  },

  loadActivities: function() {
    const loaderView = new LoaderView();
    App.regions.main.show(loaderView, {preventDestroy: true});
    // @todo How to display loader view now without destroying main view?
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
        API.showActivities(receivedData);
        appModel.set('activities', receivedData);
        appModel.save();
        App.regions.main.show(API.mainView);
      },
      error(xhr, ajaxOptions, thrownError) {
        Log('Activities load failed');
        App.regions.main.show(API.mainView);
      },
    });
  },

  show() {
    Log('Activities:Controller: showing');

    // HEADER
    let refreshView = new RefreshView({
      model: new Backbone.Model({ appModel:appModel })
    });

    refreshView.on('refreshClick', function () {
      Log('Activities:List:Controller: refresh clicked');

      API.loadActivities();
    });

    const headerView = new HeaderView({
      rightPanel: refreshView,
      model: new Backbone.Model({
        title: 'Activities',
      }),
    });

    App.regions.header.show(headerView);

    // FOOTER
    App.regions.footer.hide().empty();

    // MAIN
    API.mainView = new MainView({
      collection: API.activitiesList
    });


    let onExit = () => {
      Log('Activities:List:Controller: exiting');
      let groupId = API.mainView.getGroupId();
      API.save(groupId);
    };
    // if exit on selection click
    API.mainView.on('save', onExit);
    headerView.onExit = onExit;

    // Don't reload the activities if the user has already loaded them
    var activitiesData = appModel.get('activities');
    if (activitiesData===null) {
      API.loadActivities();
    } else {
      API.showActivities(activitiesData);
      App.regions.main.show(API.mainView);
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
