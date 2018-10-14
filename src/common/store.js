import Indicia from 'indicia';
import _ from 'lodash';
import CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

// create local store
const storeConfig = {};
// enable SQLite
if (window.cordova) {
  _.extend(storeConfig, {
    driverOrder: [CordovaSQLiteDriver, 'indexeddb', 'websql']
  });
}
const store = new Indicia.Store(storeConfig);

export default store;
