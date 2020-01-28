/** ****************************************************************************
 * User model describing the user model on backend. Persistent.
 **************************************************************************** */
import Log from 'helpers/log';
import { observable, set as setMobXAttrs, toJS } from 'mobx';
import { store } from 'common/store';
import makeRequest from 'common/helpers/makeRequest';
import * as Yup from 'yup';
import CONFIG from 'config';
import activitiesExtension from './user_model_activities_ext';
import statisticsExtension from './user_model_statistics_ext';

const getDefaultAttrs = () => ({
  isLoggedIn: false,
  drupalID: null,
  name: null,
  firstname: null,
  secondname: null,
  email: null,
  password: null,

  activities: [],

  statistics: {
    synced_on: null,
    species: [],
    speciesRaw: [],
  },
});

class UserModel {
  @observable attrs = getDefaultAttrs();

  @observable activities = { synchronizing: false };

  loginSchema = Yup.object().shape({
    name: Yup.string().required(),
    password: Yup.string().required(),
  });

  loginSchemaBackend = Yup.object().shape({
    id: Yup.number().required(),
    email: Yup.string()
      .email()
      .required(),
    name: Yup.string().required(),
  });

  resetSchema = Yup.object().shape({
    name: Yup.string().required(),
  });

  resetSchemaBackend = Yup.object().shape({
    data: Yup.object().shape({
      id: Yup.number().required(),
      firstname: Yup.string().required(),
      secondname: Yup.string().required(),
      type: Yup.string().required(),
    }),
  });

  registerSchema = Yup.object().shape({
    email: Yup.string()
      .email('email is not valid')
      .required(),
    firstname: Yup.string().required(),
    secondname: Yup.string().required(),
    password: Yup.string().required(),
    terms: Yup.boolean()
      .oneOf([true], 'must accept terms and conditions')
      .required(),
  });

  registerSchemaBackend = Yup.object().shape({
    id: Yup.number().required(),
    warehouse_id: Yup.number().required(),
    email: Yup.string()
      .email()
      .required(),
    name: Yup.string().required(),
    firstname: Yup.string().required(),
    secondname: Yup.string().required(),
  });

  constructor() {
    Log('AppModel: initializing');
    this._init = store.find('user').then(user => {
      if (typeof user === 'string') {
        // backwards compatibility
        user = JSON.parse(user); // eslint-disable-line
      }

      if (!user) {
        Log('UserModel: persisting for the first time');
        this.save();
        return;
      }

      setMobXAttrs(this.attrs, user.attrs);
    });

    // TODO:
    // .then(() => this.statisticsExtensionInit())
    // .then(() => this.activitiesExtensionInit());
  }

  get(name) {
    return this.attrs[name];
  }

  set(name, value) {
    this.attrs[name] = value;
    return this;
  }

  async save() {
    return store.save('user', { attrs: toJS(this.attrs) });
  }

  /**
   * Resets the user login information.
   */
  logOut() {
    setMobXAttrs(this.attrs, getDefaultAttrs());
    return this.save();
  }

  async logIn(details) {
    Log('User: logging in.');

    const userAuth = btoa(`${details.name}:${details.password}`);
    const url = CONFIG.users.url + encodeURIComponent(details.name);
    const options = {
      headers: {
        authorization: `Basic ${userAuth}`,
        'x-api-key': CONFIG.indicia.api_key,
        'content-type': 'application/json',
      },
    };

    let res;
    try {
      res = await makeRequest(url, options, CONFIG.users.timeout);
      const isValidResponse = await this.loginSchemaBackend.isValid(res.data);
      if (!isValidResponse) {
        throw new Error('Invalid backend response.');
      }
    } catch (e) {
      throw new Error(t(e.message));
    }

    const user = { ...res.data, ...{ password: details.password } };
    this._logIn(user);
  }

  async register(details) {
    Log('User: registering.');
    const userAuth = btoa(`${details.name}:${details.password}`);
    const options = {
      method: 'post',
      mode: 'cors',
      headers: {
        authorization: `Basic ${userAuth}`,
        'x-api-key': CONFIG.indicia.api_key,
        'content-type': 'plain/text',
      },
      body: JSON.stringify({ data: details }),
    };

    let res;
    try {
      res = await makeRequest(CONFIG.users.url, options, CONFIG.users.timeout);
      const isValidResponse = await this.registerSchemaBackend.isValid(res.data);
      if (!isValidResponse) {
        throw new Error('Invalid backend response.');
      }
    } catch (e) {
      throw new Error(t(e.message));
    }

    const user = { ...res.data, ...{ password: details.password } };
    this._logIn(user);
  }

  async reset(details) {
    Log('User: resetting.');

    const options = {
      method: 'put',
      mode: 'cors',
      headers: {
        'x-api-key': CONFIG.indicia.api_key,
        'content-type': 'plain/text',
      },
      body: JSON.stringify({
        data: {
          type: 'users',
          password: ' ', // reset password
        },
      }),
    };

    let res;
    try {
      const url = CONFIG.users.url + encodeURIComponent(details.name); // url + user id
      res = await makeRequest(url, options, CONFIG.users.timeout);
      const isValidResponse = await this.resetSchemaBackend.isValid(res);
      if (!isValidResponse) {
        throw new Error('Invalid backend response.');
      }
    } catch (e) {
      throw new Error(t(e.message));
    }
  }

  _logIn(user) {
    Log('UserModel: logging in.');

    this.attrs.drupalID = user.id || '';
    this.attrs.password = user.password || '';
    this.attrs.email = user.email || '';
    this.attrs.name = user.name || '';
    this.attrs.firstname = user.firstname || '';
    this.attrs.secondname = user.secondname || '';
    this.attrs.isLoggedIn = true;

    this.syncActivities();
    // TODO:
    // this.syncStats();

    return this.save();
  }

  /**
   * Returns user contact information.
   */
  hasLogIn() {
    return this.attrs.isLoggedIn;
  }

  getUser() {
    return this.attrs.email;
  }

  getPassword() {
    return this.attrs.password;
  }

  resetDefaults() {
    return this.logOut();
  }
}

// add activities management
UserModel.prototype = Object.assign(UserModel.prototype, activitiesExtension);

// add statistics management
// UserModel.prototype = Object.assign(UserModel.prototype, statisticsExtension);

const userModel = new UserModel();
export { userModel as default, UserModel };
