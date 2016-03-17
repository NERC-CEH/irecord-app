import Backbone from 'backbone';
import App from '../../../app';
import CONFIG from 'config'; // Replaced with alias
import userModel from '../../common/user_model';
import MainView from './main_view';
import HeaderView from '../../common/header_view';

let API = {
  show: function () {
    //MAIN
    let mainView = new MainView();
    App.regions.main.show(mainView);

    //HEADER
    let headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Register'
      })
    });
    App.regions.header.show(headerView);

    //Start registration
    mainView.on('form:submit', function (data) {
      if (!navigator.onLine) {
        App.regions.dialog.show({
          title: 'Sorry',
          body: 'Looks like you are offline!'
        });
        return;
      }

      let validationError = userModel.validateRegistration(data);
      if (!validationError) {
        mainView.triggerMethod("form:data:invalid", {}); //update form
        App.regions.dialog.showLoader();

        API.register(data, function (err, data) {
          if (err) {
            switch (err.xhr.status) {
              case 401:
                //unauthorised
                break;
              default:
                Log("login:submit: " + err.xhr.status + " " + err.thrownError + ".", 'e');
            }

            var response = '';
            if (err.xhr.responseText && (err.xhr.responseText == "Missing name parameter" || err.xhr.responseText.indexOf('Bad') >= 0)) {
              response = 'Bad Username or Password';
            } else {
              if ( err.thrownError &&  err.thrownError.indexOf('Unauthorised')) {
                //err.xhr.responseText = Invalid password"
                //it thinks that the user tries to update its account
                response = 'An account with this email exist';
              } else {
                response = err.thrownError;
              }
            }

            App.regions.dialog.error({message: response});
            return;
          }
          App.regions.dialog.show({
            title: 'Welcome aboard!',
            body: 'Before submitting any records please check your email and ' +
            'click on the verification link.',
            buttons:[
              {
                title: 'OK, got it',
                class: 'btn-positive',
                onClick: function () {
                  App.regions.dialog.hide();
                  window.history.back();
                }
              }
            ],
            onHide: function () {
              window.history.back();
            }
          });
        });
      } else {
        mainView.triggerMethod("form:data:invalid", validationError);
      }
    });

    //FOOTER
    App.regions.footer.hide().empty();
  },

  /**
   * Starts an app sign in to the Drupal site process.
   * The sign in endpoint is specified by CONFIG.login.url -
   * should be a Drupal sight using iForm Mobile Auth Module.
   *
   * It is important that the app authorises itself providing
   * appname and appsecret for the mentioned module.
   */
  register: function (data, callback) {
    Log('views.login: start.', 'd');

    let formData = new FormData();

    _.forEach(data, function (value, key) {
      formData.append(key, value);
    });


    //app logins
    formData.append('appname', CONFIG.morel.manager.appname);
    formData.append('appsecret', CONFIG.morel.manager.appsecret);

    $.ajax({
      url: CONFIG.login.url,
      type: 'POST',
      data: formData,
      dataType: 'text',
      contentType: false,
      processData: false,
      timeout: CONFIG.login.timeout,

      success: function (response) {
        var details = API.extractUserDetails(response);
        details.email = data.email;
        userModel.logIn(details);

        callback(null, details);
      },
      error: function (xhr, ajaxOptions, thrownError) {
        callback({
          xhr: xhr,
          ajaxOptions: ajaxOptions,
          thrownError: thrownError
        });
      }
    });
  },

  /**
   * Since the server response is not JSON, it gets user details from the response.
   * @param data
   * @returns {*}
   */
  extractUserDetails: function (data) {
    var lines = (data && data.split(/\r\n|\r|\n/g));
    if (lines && lines.length >= 3 && lines[0].length > 0) {
      return {
        'secret': lines[0],
        'name': lines[1],
        'surname': lines[2]
      };
    } else {
      Log('login:extractdetails: problems with received secret.', 'w');
      return null;
    }
  }
};

export { API as default };
