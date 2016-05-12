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
import recordManager from '../../common/record_manager';
import CONFIG from 'config'; // Replaced with alias

// clear activities if user has logged out
userModel.on('logout', () => {
  appModel.unset('activities');
  appModel.unset('currentActivityId');
  appModel.save();
});

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
  show(recordID) {
    Log('Activities:Controller: showing');

    if (!userModel.hasLogIn()) {
      API.userLoginMessage();
    }

    // HEADER
    const refreshView = new RefreshView({
      model: new Backbone.Model({ appModel }),
    });

    refreshView.on('refreshClick', () => {
      Log('Activities:List:Controller: refresh clicked');
      if (!userModel.hasLogIn()) {
        App.trigger('user:login');
        return;
      }
      API.initActivities(activitiesCollection, true);
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

    const activitiesCollection = new Backbone.Collection();
    // MAIN
    const mainView = new MainView({
      collection: activitiesCollection,
    });

    let onExit = () => {
      Log('Activities:List:Controller: exiting');
      const activity = mainView.getActivity();
      API.save(activity);
    };

    // Initialize data
    if (recordID) {
      recordManager.get(recordID, (err, recordModel) => {
        if (err) {
          Log(err, 'e');
          return;
        }

        const activity = recordModel.get('group');
        API.initActivities(activitiesCollection, activity.id);

        onExit = () => {
          Log('Activities:List:Controller: exiting');
          const newActivity = mainView.getActivity();
          API.save(newActivity, recordModel);
        };
      });
    } else {
      API.initActivities(activitiesCollection);
    }

    // if exit on selection click
    mainView.on('save', onExit);
    App.regions.main.show(mainView);

    headerView.onExit = onExit;
  },

  /**
   * Initializes the activites collection either with existing data or fresh server.
   * @param activitiesCollection
   */
  initActivities(activitiesCollection, refresh, recordActivityId) {
    const activitiesData = appModel.get('activities');
    const currentActivityId = appModel.get('currentActivityId');

    if (userModel.hasLogIn() && !activitiesData || refresh) {
      // init or refresh
      activitiesCollection.reset(); // empty list will show a loading view
      API._loadActivities(() => {
        API._updateActivitiesCollection(activitiesCollection, recordActivityId || currentActivityId);
      });
    } else {
      // load exististing local
      API._updateActivitiesCollection(activitiesCollection, recordActivityId || currentActivityId);
    }
  },

  // expireCurrentActivity() {
  //  appModel.set('currentActivityId', null);
  //  appModel.save();
  //  App.regions.dialog.show({
  //    title: 'Information',
  //    body: 'The previously selected activity is no longer available so the default ' +
  //    'activity has been selected for you.',
  //    buttons: [{
  //      id: 'ok',
  //      title: 'OK',
  //      onClick: App.regions.dialog.hide,
  //    }],
  //  });
  // },

  /**
   * Method for loading the activities into the view, either from the warehouse
   * or the copy cached in the app model.
   * @param activitiesData Array of activity objects with id, description and title.
   */
  _updateActivitiesCollection(activitiesCollection, currentActivityId) {
    appModel.checkCurrentActivityExpiry();

    const defaultActivity = new ActivityRecord({
      title: 'Default',
      description: '',
      checked: !currentActivityId,
    });

    let foundOneToCheck = false;
    activitiesCollection.reset();
    activitiesCollection.add(defaultActivity);

    const activitiesData = appModel.get('activities');
    $.each(activitiesData, (index, activity) => {
      activity.checked = currentActivityId == activity.id; //todo:  server '71' == local 71
      foundOneToCheck = foundOneToCheck || activity.checked;

      // shorten the description to the first sentence if necessary
      activity.description = StringHelp.limit(activity.description);
      activitiesCollection.add(new ActivityRecord(activity));
    });
  },

  /**
   * Loads the list of available activities from the warehouse then updates the
   * collection in the main view.
   */
  _loadActivities(callback) {
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
        callback();
      },
      error(err) {
        Log('Activities load failed');
        callback(err);
      },
    });
  },

  save(activity = {}, recordModel) {
    if (recordModel) {
      recordModel.set('group', activity);
      recordModel.save(null, {
        success: () => {
          // return to previous page after save
          window.history.back();
        },
      });
    } else {
      appModel.set('currentActivityId', activity.id);
      appModel.save(null, {
        success: () => {
          // return to previous page after save
          window.history.back();
        },
      });
    }
  },

  /**
   * Notify the user why the there are no activities.
   */
  userLoginMessage() {
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
  },
};

export { API as default };
