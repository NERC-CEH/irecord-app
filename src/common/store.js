import Indicia from 'indicia';
import CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import LocalForage from 'localforage';

// create local store
let storeConfig = {
  driverOrder: ['indexeddb', 'websql', 'localstorage']
};

// enable SQLite
if (window.cordova) {
  storeConfig = Object.assign({}, storeConfig, {
    driverOrder: [CordovaSQLiteDriver, 'indexeddb', 'websql'],
  });
}

export default new Indicia.Store(storeConfig);

function getLocalForage() {
  function _getDriverOrder(drivers) {
    return drivers.map(driver => {
      switch (driver) {
        case 'indexeddb':
          return LocalForage.INDEXEDDB;
        case 'websql':
          return LocalForage.WEBSQL;
        case 'localstorage':
          return LocalForage.LOCALSTORAGE;
        default:
          // custom
          if (typeof driver === 'object' && driver._driver) {
            return driver._driver;
          }
          return console.error('No such db driver!');
      }
    });
  }

    let customDriversPromise = Promise.resolve();
    const { driverOrder } = storeConfig;
    if (driverOrder && typeof driverOrder[0] === 'object') {
      customDriversPromise = LocalForage.defineDriver(driverOrder[0]);
    }

    return customDriversPromise.then(() => {
      const dbConfig = {
        name: 'indicia',
        storeName: 'generic',
      };

      // init
      const localForage = LocalForage.createInstance(dbConfig);
      return localForage
        .setDriver(_getDriverOrder(driverOrder))
        .then(() => localForage)
    });
}

let store;
export function getStore() {
  if (!store) {
    return getLocalForage().then(localForage => {
      store = localForage;
      return store;
    });
  }

  return Promise.resolve(store);
}
