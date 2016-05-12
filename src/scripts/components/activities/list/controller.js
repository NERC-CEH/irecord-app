/*******************************************************************************
 * Activities List controller.
 ******************************************************************************/
import $ from 'jquery';
import Backbone from 'backbone';
import Log from '../../../helpers/log';
import StringHelp from '../../../helpers/string';
import App from '../../../app';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';
import RefreshView from './refresh_view';
import appModel from '../../common/models/app_model';
import userModel from '../../common/models/user_model';
import CONFIG from 'config'; // Replaced with alias
import LoaderView from '../../common/views/loader_view';

/**
 * Model to hold details of an activity (group entity)
 */
const ActivityRecord = Backbone.Model.extend({
  defaults: {
    id: null,
    title: '',
    description: '',
    type: '',
    group_from_date: null,
    group_to_date: null,
    checked: false,
  },
});

const API = {
  activitiesList: new Backbone.Collection(),

  mainView: null,

  expireCurrentActivity() {
    appModel.set('currentActivityId', null);
    appModel.save();
    App.regions.dialog.show({
      title: 'Information',
      body: 'The previously selected activity is no longer available so the default ' +
      'activity has been selected for you.',
      buttons: [{
        id: 'ok',
        title: 'OK',
        onClick: App.regions.dialog.hide,
      }],
    });
  },

  /**
   * Method for loading the activities into the view, either from the warehouse
   * or the copy cached in the app model.
   * @param activitiesData Array of activity objects with id, description and title.
   */
  showActivities(activitiesData) {
    appModel.checkCurrentActivityExpiry();
    const currentActivityId = appModel.get('currentActivityId');
    const defaultActivity = new ActivityRecord({
      title: 'iRecord',
      description: 'Submit records to iRecord which are not part of any specific activity',
      checked: !currentActivityId,
    });

    let foundOneToCheck = false;
    API.activitiesList.reset();
    API.activitiesList.add(defaultActivity);
    $.each(activitiesData, (activity) => {
      this.checked = currentActivityId === this.id;
      foundOneToCheck = foundOneToCheck || this.checked;

      // shorten the description to the first sentence if necessary
      activity.description = StringHelp.limit(activity.description);
      API.activitiesList.add(new ActivityRecord(activity));
    });
  },

  /**
   * Loads the list of available activities from the warehouse then updates the
   * collection in the main view.
   */
  loadActivities() {
    const loaderView = new LoaderView();
    if (!userModel.get('email')) {
      App.regions.dialog.show({
        title: 'Information',
        body: 'Please log in to the app before selecting an alternative ' +
        'activity for your records.',
        buttons: [{
          id: 'ok',
          title: 'OK',
          onClick: App.regions.dialog.hide,
        }],
      });
      API.showActivities([]);
      return;
    }
    App.regions.main.show(loaderView, { preventDestroy: true });
    // @todo How to display loader view now without destroying main view?
    const data = {
      report: 'library/groups/groups_for_app.xml',
      // user_id filled in by iform_mobile_auth proxy
      // @todo Fill in the correct form path once it is known

      // @todo USER ID NOT FILLING IN PROPERLY

      path: 'enter-record-list',
      email: userModel.get('email'),
      appname: CONFIG.morel.manager.appname,
      appsecret: CONFIG.morel.manager.appsecret,
      usersecret: userModel.get('secret'),
    };

    $.ajax({
      url: CONFIG.report.url,
      type: 'POST',
      data,
      dataType: 'JSON',
      timeout: CONFIG.report.timeout,
      success(receivedData) {
        // Cache the actities list in the app model to avoid hitting the web
        // services on every page visit.
        appModel.set('activities', receivedData);
        appModel.save();
        API.showActivities(receivedData);
        App.regions.main.show(API.mainView);
      },
      error() {
        Log('Activities load failed');
        App.regions.main.show(API.mainView);
      },
    });
  },

  show() {
    Log('Activities:Controller: showing');

    // HEADER
    const refreshView = new RefreshView({
      model: new Backbone.Model({ appModel }),
    });

    refreshView.on('refreshClick', () => {
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
      collection: API.activitiesList,
    });


    function onExit() {
      Log('Activities:List:Controller: exiting');
      const activityId = API.mainView.getActivityId();
      API.save(activityId);
    }
    // if exit on selection click
    API.mainView.on('save', onExit);
    headerView.onExit = onExit;

    // Don't reload the activities if the already cached in the app model.
    const activitiesData = appModel.get('activities');
    if (!activitiesData) {
      API.loadActivities();
    } else {
      API.showActivities(activitiesData);
      App.regions.main.show(API.mainView);
    }
  },

  save(activityId) {
    appModel.set('currentActivityId', activityId);
    appModel.save(null, {
      success: () => {
        // return to previous page after save
        window.history.back();
      },
    });
  },
};

export { API as default };
