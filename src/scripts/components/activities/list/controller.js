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
    checked: false,
    from_date: null,
    to_date: null
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
    let currentGroupId = appModel.get('groupId');
    let defaultActivity = new ActivityRecord({
      title:"iRecord",
      description:"Submit records to iRecord which are not part of any specific activity",
      checked: !currentGroupId
    });
    let today = new Date().setHours(0,0,0,0);
    API.activitiesList.reset();
    API.activitiesList.add(defaultActivity);
    $.each(activitiesData, function() {
      this.checked = currentGroupId===this.id;
      if ((this.from_date && new Date(this.from_date).setHours(0,0,0,0) > today)
          || (this.to_date && new Date(this.to_date).setHours(0,0,0,0) < today)) {
        // activity is out of allowed date range
        if (this.checked) {
          // this is the selected activity, so revert to the defaultActivity
          defaultActivity.attributes.checked = true;
          appModel.set('groupId', null);
          appModel.save();
          App.regions.dialog.show({
            title: 'Information',
            body: 'The previously selected activity is no longer available so the default ' +
                'activity has been selected for you.',
            buttons: [{
              id: 'ok',
              title: 'OK',
              onClick: App.regions.dialog.hide
            }]
          });
        }
      } else {
        API.activitiesList.add(new ActivityRecord(this));
      }

    });
  },

  /**
   * Loads the list of available activities from the warehouse then updates the
   * collection in the main view.
   */
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
        // Cache the actities list in the app model to avoid hitting the web
        // services on every page visit.
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

    // Don't reload the activities if the already cached in the app model.
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
        // return to previous page after save
        window.history.back();
      }
    });

  }
};

export { API as default };
