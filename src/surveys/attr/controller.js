/** ****************************************************************************
 * Surveys Attr controller.
 **************************************************************************** */
import Backbone from 'backbone';
import savedSamples from 'saved_samples';
import radio from 'radio';
import appModel from 'app_model';
import Log from 'helpers/log';
import viceCounties from 'common/data/vice_counties.data';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';
// import LockView from '../../common/views/attr_lock_view';

const API = {
  show(sampleID, attr) {
    // wait till savedSamples is fully initialized
    if (savedSamples.fetching) {
      savedSamples.once('fetching:done', () => {
        API.show.apply(this, [sampleID, attr]);
      });
      return;
    }

    Log(`Surveys:Attr:Controller: showing ${attr}.`);

    const sample = savedSamples.get(sampleID);
    // Not found
    if (!sample) {
      Log('No sample model found.', 'e');
      radio.trigger('app:404:show', { replace: true });
      return;
    }

    // can't edit a saved one - to be removed when sample update
    // is possible on the server
    if (sample.metadata.synced_on) {
      radio.trigger('Surveys:show', sampleID, { replace: true });
      return;
    }

    // MAIN
    const mainView = new MainView({
      attr,
      model: sample,
      viceCounties
    });
    // if exit on selection click
    mainView.on('save', () => {
      API.onExit(mainView, sample, attr, () => {
        // window.history.back();
      });
    });

    radio.trigger('app:main', mainView);

    // HEADER
    // const lockView = new LockView({
    //   model: new Backbone.Model({ appModel, sample }),
    //   attr,
    //   onLockClick: API.onLockClick,
    // });

    const headerView = new HeaderView({
      onExit() {
        API.onExit(mainView, sample, attr, () => {
          window.history.back();
        });
      },
      // rightPanel: lockView,
      model: new Backbone.Model({ title: attr })
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
    const attr = view.options.attr;
    const fullAttrName = `occ:${attr}`;
    Log('Surveys:Attr:Controller: lock clicked.');
    // invert the lock of the attribute
    // real value will be put on exit
    appModel.setAttrLock(fullAttrName, !appModel.getAttrLock(fullAttrName));
  },

  onExit(mainView, sample, attr, callback) {
    Log('Surveys:Attr:Controller: exiting.');
    const values = mainView.getValues();
    API.save(attr, values, sample, callback);
  },

  /**
   * Update sample with new values
   * @param values
   * @param sample
   */
  save(attr, values, sample, callback) {
    Log('Surveys:Attr:Controller: saving.');

    let currentVal;
    let newVal;

    switch (attr) {
      case 'date':
        currentVal = sample.get('date');

        // validate before setting up
        if (values.date && values.date.toString() !== 'Invalid Date') {
          newVal = values.date;
          sample.set('date', newVal);
        }
        break;
      case 'vice-county':
        currentVal = sample.get(attr);
        newVal = null;
        // validate - check if exists in the list
        viceCounties.forEach(vc => {
          if (vc.code === values[attr] || vc.name === values[attr]) {
            newVal = vc;
          }
        });
        if (newVal) {
          sample.set(attr, newVal);
        }
        break;
      case 'recorders':
      case 'comment':
        currentVal = sample.get(attr);
        newVal = values[attr];

        // TODO:validate before setting up
        sample.set(attr, newVal);
        break;
      default:
    }

    // save it
    sample
      .save()
      .then(() => {
        // update locked value if attr is locked
        API.updateLock(attr, newVal, currentVal);
        callback();
      })
      .catch(err => {
        Log(err, 'e');
        radio.trigger('app:dialog:error', err);
      });
  },

  updateLock() {
    // eslint-disable-line
    // let lockedValue = appModel.getAttrLock(attr, 'plant');
    // switch (attr) {
    //   case 'date':
    //     if (!lockedValue ||
    //       (lockedValue && DateHelp.print(newVal) === DateHelp.print(new Date()))) {
    //       // don't lock current day
    //       appModel.setAttrLock(attr, null);
    //     } else {
    //       appModel.setAttrLock(attr, newVal);
    //     }
    //     break;
    //   default:
    //     if (lockedValue && (lockedValue === true || lockedValue === currentVal)) {
    //       appModel.setAttrLock(attr, newVal);
    //     }
    // }
  }
};

export { API as default };
