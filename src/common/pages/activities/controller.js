/** *****************************************************************************
 * Activities List controller.
 ***************************************************************************** */
import Backbone from 'backbone';
import Log from 'helpers/log';
import Analytics from 'helpers/analytics';
import App from 'app';
import radio from 'radio';
import appModel from 'app_model';
import userModel from 'user_model';
import savedSamples from 'saved_samples';
import MainView from './main_view';
import HeaderView from '../../views/header_view';
import RefreshView from './refresh_view';

/**
 * Model to hold details of an activity (activity entity)
 */
const ActivityModel = Backbone.Model.extend({
  defaults: {
    id: null,
    title: '',
    description: '',
    activity_type: '',
    activity_from_date: null,
    activity_to_date: null,
    checked: false
  }
});

let sample; // should be initialized if editing samples' activity

const ActivitiesCollection = Backbone.Collection.extend({
  model: ActivityModel,

  initialize() {
    Log('Activities:Controller: initializing collection.');

    this.updateActivitiesCollection();

    this.listenTo(userModel, 'sync:activities:start', () => {
      Log('Activities:Controller: reseting collection for sync.');
      this.reset();
    });
    this.listenTo(
      userModel,
      'sync:activities:end',
      this.updateActivitiesCollection
    );
  },

  updateActivitiesCollection() {
    Log('Activities:Controller: updating collection.');

    // if loading have empty collection
    if (userModel.activities && userModel.activities.synchronizing) {
      this.reset();
      return;
    }

    const lockedActivity = appModel.getAttrLock('smp:activity');
    let sampleActivity;

    if (sample) {
      sampleActivity = sample.get('activity');
    }

    const selectedActivity = sampleActivity || lockedActivity || {};

    // add default activity
    const defaultActivity = new ActivityModel({
      title: t('Default'),
      description: '',
      checked: !selectedActivity.id
    });

    this.reset();
    this.add(defaultActivity);

    // add user activities
    userModel.get('activities').forEach(activity => {
      // TODO:  server '71' == local 71
      const checkedActivity = Object.assign({}, activity, {
        checked: selectedActivity.id === activity.id
      });
      this.add(new ActivityModel(checkedActivity));
    });
  }
});

const activitiesCollection = new ActivitiesCollection();

const API = {
  show(sampleID) {
    Log('Activities:Controller: showing.');

    if (!userModel.hasLogIn()) {
      API.userLoginMessage();
    }

    // HEADER
    const refreshView = new RefreshView();

    const headerView = new HeaderView({
      rightPanel: refreshView,
      model: new Backbone.Model({
        title: 'Activities'
      })
    });

    radio.trigger('app:header', headerView);

    // FOOTER
    radio.trigger('app:footer:hide');

    // MAIN
    const mainView = new MainView({
      collection: activitiesCollection
    });

    let onExit = () => {
      Log('Activities:List:Controller: exiting.');
      const activity = mainView.getActivity();
      API.save(activity);
    };

    // Initialize data
    if (sampleID) {
      // wait till savedSamples is fully initialized
      if (savedSamples.fetching) {
        savedSamples.once('fetching:done', () => {
          API.show.apply(this, [sampleID]);
        });
        return;
      }

      sample = savedSamples.get(sampleID);
      activitiesCollection.updateActivitiesCollection();

      onExit = () => {
        Log('Activities:List:Controller: exiting.');
        const newActivity = mainView.getActivity();
        API.save(newActivity);
        sample = null; // reset
      };

      refreshView.on('refreshClick', () => {
        Log('Activities:List:Controller: refresh clicked.');
        if (!userModel.hasLogIn()) {
          radio.trigger('user:login');
          return;
        }
        API.refreshActivities();
      });
    } else {
      activitiesCollection.updateActivitiesCollection();

      refreshView.on('refreshClick', () => {
        Log('Activities:List:Controller: refresh clicked.');
        if (!userModel.hasLogIn()) {
          radio.trigger('user:login');
          return;
        }
        API.refreshActivities();
      });
    }

    // if exit on selection click
    mainView.on('save', onExit);
    radio.trigger('app:main', mainView);

    headerView.onExit = onExit;
  },

  refreshActivities() {
    userModel.syncActivities(true).catch(err => {
      Log(err, 'e');
      radio.trigger('app:dialog:error', err);
    });
    Analytics.trackEvent('Activities', 'refresh');
  },

  save(activity = {}) {
    const activityID = activity.id;
    if (sample) {
      sample.set('activity', userModel.getActivity(activityID));
      sample
        .save()
        .then(() => window.history.back()) // return to previous page after save
        .catch(err => {
          Log(err, 'e');
          radio.trigger('app:dialog:error', err);
        });
    } else {
      appModel.setAttrLock('smp:activity', userModel.getActivity(activityID));
      // return to previous page after save
      window.history.back();
    }
  },

  /**
   * Notify the user why the there are no activities.
   */
  userLoginMessage() {
    radio.trigger('app:dialog', {
      title: 'Information',
      body:
        'Please log in to the app before selecting an alternative ' +
        'activity for your records.',
      buttons: [
        {
          id: 'ok',
          title: 'OK',
          onClick: App.regions.getRegion('dialog').hide
        }
      ]
    });
  }
};

export { API as default };
