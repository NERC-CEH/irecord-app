/** ****************************************************************************
 * Sample Attribute controller.
 *****************************************************************************/
import Backbone from 'backbone';
import Indicia from 'indicia';
import Log from 'helpers/log';
import DateHelp from 'helpers/date';
import radio from 'radio';
import appModel from 'app_model';
import savedSamples from 'saved_samples';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';
import LockView from '../../common/views/attr_lock_view';

const API = {
  show(sampleID, attr) {
    // wait till savedSamples is fully initialized
    if (savedSamples.fetching) {
      const that = this;
      savedSamples.once('fetching:done', () => {
        API.show.apply(that, [sampleID, attr]);
      });
      return;
    }

    Log(`Samples:Attr:Controller: showing ${attr}.`);

    const sample = savedSamples.get(sampleID);
    // Not found
    if (!sample) {
      Log('No sample model found.', 'e');
      radio.trigger('app:404:show', { replace: true });
      return;
    }

    // can't edit a saved one - to be removed when sample update
    // is possible on the server
    if (sample.getSyncStatus() === Indicia.SYNCED) {
      radio.trigger('samples:show', sampleID, { replace: true });
      return;
    }

    // MAIN
    const mainView = new MainView({
      attr,
      model: sample,
    });
    radio.trigger('app:main', mainView);

    // HEADER
    const lockView = new LockView({
      model: new Backbone.Model({ appModel, sample }),
      attr,
      onLockClick: API.onLockClick,
    });

    const headerView = new HeaderView({
      onExit() {
        API.onExit(mainView, sample, attr, () => {
          window.history.back();
        });
      },
      rightPanel: lockView,
      model: new Backbone.Model({ title: attr }),
    });

    radio.trigger('app:header', headerView);

    // if exit on selection click
    mainView.on('save', () => {
      API.onExit(mainView, sample, attr, () => {
        window.history.back();
      });
    });

    // FOOTER
    radio.trigger('app:footer:hide');
  },

  onLockClick(view) {
    Log('Samples:Attr:Controller: lock clicked.');
    const attr = view.options.attr;
    // invert the lock of the attribute
    // real value will be put on exit
    if (attr === 'number') {
      if (appModel.getAttrLock(attr), 'general') {
        appModel.setAttrLock(attr, !appModel.getAttrLock(attr, 'general'), 'general');
      } else {
        appModel.setAttrLock('number-ranges',
          !appModel.getAttrLock('number-ranges'), 'general');
      }
    } else {
      appModel.setAttrLock(attr, !appModel.getAttrLock(attr, 'general'), 'general');
    }
  },

  onExit(mainView, sample, attr, callback) {
    Log('Samples:Attr:Controller: exiting.');
    const values = mainView.getValues();
    API.save(attr, values, sample, callback);
  },

  /**
   * Update sample with new values
   * @param values
   * @param sample
   */
  save(attr, values, sample, callback) {
    Log('Samples:Attr:Controller: saving.');

    let currentVal;
    let newVal;
    const occ = sample.getOccurrence();

    switch (attr) {
      case 'date':
        currentVal = sample.get('date');

        // validate before setting up
        if (values.date && values.date.toString() !== 'Invalid Date') {
          newVal = values.date;
          sample.set('date', newVal);
        }
        break;
      case 'number':
        currentVal = occ.get('number');

        // todo: validate before setting up
        if (values.number) {
          // specific number
          newVal = values.number;
          occ.set('number', newVal);
          occ.unset('number-ranges');
        } else if (values['number-ranges']) {
          // number ranges
          attr = 'number-ranges'; // eslint-disable-line
          newVal = values[attr];
          occ.set('number-ranges', newVal);
          occ.unset('number');
        }
        break;
      case 'stage':
      case 'identifiers':
      case 'comment':
        currentVal = occ.get(attr);
        newVal = values[attr];

        // todo:validate before setting up
        occ.set(attr, values[attr]);
        break;
      default:
    }

    // save it
    sample.save()
      .then(() => {
        // update locked value if attr is locked
        API.updateLock(attr, newVal, currentVal);
        callback();
      })
      .catch((err) => {
        Log(err, 'e');
        radio.trigger('app:dialog:error', err);
      });
  },

  updateLock(attr, newVal, currentVal) {
    let lockedValue = appModel.getAttrLock(attr, 'general');

    switch (attr) {
      case 'date':
        if (!lockedValue ||
          (lockedValue && DateHelp.print(newVal) === DateHelp.print(new Date()))) {
          // don't lock current day
          appModel.setAttrLock(attr, null, 'general');
        } else {
          appModel.setAttrLock(attr, newVal, 'general');
        }
        break;
      case 'number-ranges':
        if (!lockedValue) {
          lockedValue = appModel.getAttrLock('number', 'general');
        }
      case 'number':
        if (!lockedValue) {
          lockedValue = appModel.getAttrLock('number-ranges', 'general');
        }

        if (!lockedValue) return; // nothing was locked

        if (attr === 'number-ranges') {
          appModel.setAttrLock(attr, newVal, 'general');
          appModel.setAttrLock('number', null, 'general');
        } else {
          appModel.setAttrLock(attr, newVal, 'general');
          appModel.setAttrLock('number-ranges', null, 'general');
        }
        break;
      default:
        if (lockedValue && (lockedValue === true || lockedValue === currentVal)) {
          appModel.setAttrLock(attr, newVal, 'general');
        }
    }
  },
};

export { API as default };
