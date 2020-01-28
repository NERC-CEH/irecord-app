import CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import LocalForage from 'localforage';
import _ from 'lodash';

/* eslint-disable */
// DEVELOPMENT ONLY
// async function printDiff(localForage, key, val) {
//   const { diff } = require('deep-diff');

//   const { storeName } = localForage._config;
//   const currentVal = await localForage.getItem(key);
//   const delta = diff(currentVal, val);
//   if (!delta) {
//     return;
//   }
//   console.groupCollapsed(`diff ${storeName} ${key}`);
//   let allAggs = {};
//   delta.forEach(difference => {
//     const agg = {
//       [storeName]: {
//         [key]: {},
//       },
//     };

//     if (!difference.path) {
//       agg[storeName][key] = difference.rhs;
//       console.log(JSON.stringify(agg, null, 2));
//       return;
//     }

//     difference.path.reduce((a, aKey, i) => {
//       if (difference.path.length - 1 > i) {
//         a[aKey] = {};
//         return a[aKey];
//       }

//       const leftStr = JSON.stringify(difference.lhs, null, 2);
//       const rightStr = JSON.stringify(difference.rhs, null, 2);
//       a[aKey] = `${leftStr} -> ${rightStr}`;
//     }, agg[storeName][key]);
//     allAggs = _.merge(allAggs, agg);
//   });

//   console.log(JSON.stringify(allAggs, null, 2));
//   console.groupEnd();
// }
/* eslint-enable */

class Store {
  constructor(options = {}) {
    // initialize db
    this.localForage = null;
    this.ready = new Promise((resolve, reject) => {
      // check custom drivers (eg. SQLite)
      const customDriversPromise = new Promise(_resolve => {
        if (options.driverOrder && typeof options.driverOrder[0] === 'object') {
          LocalForage.defineDriver(options.driverOrder[0]).then(_resolve);
        } else {
          _resolve();
        }
      });

      if (!options.storeName) {
        throw new Error('storeName prop is missing');
      }

      // config
      customDriversPromise.then(() => {
        const dbConfig = {
          name: options.name || 'indicia',
          storeName: options.storeName,
        };

        if (options.version) {
          dbConfig.version = options.version;
        }

        const driverOrder = options.driverOrder || [
          'indexeddb',
          'websql',
          'localstorage',
        ];
        const drivers = Store._getDriverOrder(driverOrder);
        const DB = options.LocalForage || LocalForage;

        // init
        this.localForage = DB.createInstance(dbConfig);
        this.localForage
          .setDriver(drivers)
          .then(resolve)
          .catch(reject);
      });
    });
  }

  static _getDriverOrder(driverOrder) {
    return driverOrder.map(driver => {
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

  async save(key, val) {
    await this.ready;

    if (!key) {
      throw new Error('Invalid key passed to store');
    }

    // printDiff(this.localForage, key, val); // DEVELOPMENT ONLY

    return this.localForage.setItem(key, val);
  }

  async find(key) {
    await this.ready;

    if (!key) {
      throw new Error('Invalid key passed to store');
    }

    return this.localForage.getItem(key);
  }

  async findAll() {
    await this.ready;

    // build up samples
    const models = [];
    await this.localForage.iterate(value => {
      models.push(value);
    });

    return models;
  }

  async destroy(key) {
    await this.ready;

    if (!key) {
      throw new Error('Invalid key passed to store');
    }

    return this.localForage.removeItem(key);
  }

  async destroyAll() {
    await this.ready;

    const models = await this.findAll();
    return Promise.all(models.map(model => this.destroy(model)));
  }
}

// create local store
let storeConfig = {
  driverOrder: ['indexeddb', 'websql', 'localstorage'],
};

// enable SQLite
if (window.cordova) {
  storeConfig = {
    ...storeConfig,
    ...{
      driverOrder: [CordovaSQLiteDriver, 'indexeddb', 'websql'],
    },
  };
}

const modelStore = new Store({ ...storeConfig, ...{ storeName: 'models' } });
const store = new Store({ ...storeConfig, ...{ storeName: 'generic' } });

window.exportStore = async () => {
  const app = await store.find('app');
  const user = await store.find('user');
  const models = await modelStore.findAll();

  const exportedStore = {
    generic: {
      app: JSON.parse(app),
      user: JSON.parse(user),
    },
    models,
  };

  return JSON.stringify(exportedStore);
};

window.importStore = async ({ generic, models }) => {
  const { app, user } = generic;
  await store.save('app', app);
  await store.save('user', user);

  await modelStore.destroyAll();

  // eslint-disable-next-line
  for (const model of models) {
    // eslint-disable-next-line
    await modelStore.save(model.cid, model);
  }
};

export { modelStore, store };
