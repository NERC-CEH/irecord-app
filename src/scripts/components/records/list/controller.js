/** ****************************************************************************
 * Record List controller.
 *****************************************************************************/
import Morel from 'morel';
import App from '../../../app';
import log from '../../../helpers/log';
import Error from '../../../helpers/error';
import ImageHelp from '../../../helpers/image';
import appModel from '../../common/app_model';
import recordManager from '../../common/record_manager';
import Sample from '../../common/sample';
import Occurrence from '../../common/occurrence';
import MainView from './main_view';
import HeaderView from './header_view';
import LoaderView from '../../common/loader_view';

const API = {
  show() {
    const loaderView = new LoaderView();
    App.regions.main.show(loaderView);

    recordManager.getAll((getError, recordsCollection) => {
      log('Records:List:Controller: showing');
      if (getError) {
        log(getError, 'e');
        App.regions.dialog.error(getError);
        return;
      }

      // MAIN
      const mainView = new MainView({
        collection: recordsCollection,
        appModel,
      });

      mainView.on('childview:record:edit:attr', (childView, attr) => {
        App.trigger('records:edit:attr', childView.model.id || childView.model.cid, attr);
      });

      mainView.on('childview:record:delete', (childView) => {
        log('Records:List:Controller: deleting record');

        const recordModel = childView.model;
        const syncStatus = recordModel.getSyncStatus();
        let body = 'This record hasn\'t been saved to iRecord yet, ' +
          'are you sure you want to remove it from your device?';

        if (syncStatus === Morel.SYNCED) {
          body = 'Are you sure you want to remove this record from your device?';
          body += '</br><i><b>Note:</b> it will remain on the server.</i>';
        }
        App.regions.dialog.show({
          title: 'Delete',
          body,
          buttons: [
            {
              title: 'Cancel',
              onClick() {
                App.regions.dialog.hide();
              },
            },
            {
              title: 'Delete',
              class: 'btn-negative',
              onClick() {
                childView.model.destroy();
                App.regions.dialog.hide();
              },
            },
          ],
        });
      });
      App.regions.main.show(mainView);
    });

    // HEADER
    const headerView = new HeaderView();

    headerView.on('photo:upload', (e) => {
      log('Records:List:Controller: photo upload');

      // show loader
      API.createNewRecord(e.target.files[0], () => {
        // hide loader
      });
    });

    // android gallery/camera selection
    headerView.on('photo:selection', () => {
      log('Records:List:Controller: photo select');

      App.regions.dialog.show({
        title: 'Choose a method to upload a photo',
        buttons: [
          {
            title: 'Camera',
            onClick() {
              ImageHelp.getImage((entry) => {
                API.createNewRecord(entry.nativeURL, ()=>{});
              });
              App.regions.dialog.hide();
            },
          },
          {
            title: 'Gallery',
            onClick() {
              ImageHelp.getImage((entry) => {
                API.createNewRecord(entry.nativeURL, ()=>{});
              }, {
                sourceType: window.Camera.PictureSourceType.PHOTOLIBRARY
              });
              App.regions.dialog.hide();
            },
          },
        ],
      });
    });

    App.regions.header.show(headerView);

    // FOOTER
    App.regions.footer.hide().empty();
  },

  /**
   * Creates a new record with an image passed as an argument.
   */
  createNewRecord(photo, callback) {
    ImageHelp.getImageModel(photo, (err, image) => {
      if (err || !image) {
        const err = new Error('Missing image.');
        callback(err);
        return;
      }
      const occurrence = new Occurrence();
      occurrence.addImage(image);

      const sample = new Sample();
      sample.addOccurrence(occurrence);

      // append locked attributes
      appModel.appendAttrLocks(sample);

      recordManager.set(sample, (saveErr) => {
        if (saveErr) {
          callback(saveErr);
          return;
        }
        // check if location attr is not locked
        const locks = appModel.get('attrLocks');

        if (!locks.location) {
          // no previous location
          sample.startGPS();
        } else if (!locks.location.latitude || !locks.location.longitude) {
          // previously locked location was through GPS
          // so try again
          sample.startGPS();
        }
        callback();
      });
    });
  },
};

export { API as default };
