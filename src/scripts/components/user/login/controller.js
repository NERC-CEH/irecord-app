  import $ from 'jquery';
  import Backbone from 'backbone';
  import App from '../../../app';
  import log from '../../../helpers/log';
  import CONFIG from 'config'; // Replaced with alias
  import userModel from '../../common/user_model';
  import MainView from './main_view';
  import HeaderView from '../../common/header_view';

  let API = {
    show: function () {
      //don't show if logged in
      if (userModel.hasLogIn()) {
        window.history.back();
      }

      //MAIN
      let mainView = new MainView();
      App.regions.main.show(mainView);

      //HEADER
      let headerView = new HeaderView({
        model: new Backbone.Model({
          title: 'Login'
        })
      });
      App.regions.header.show(headerView);

      mainView.on('form:submit', function (data) {
        if (!navigator.onLine) {
          App.regions.dialog.show({
            title: 'Sorry',
            body: 'Looks like you are offline!'
          });
          return;
        }

        let validationError = userModel.validateLogin(data);
        if (!validationError) {
          mainView.triggerMethod("form:data:invalid", {}); //update form
          App.regions.dialog.showLoader();

          API.login(data, function (err, data) {
            if (err) {
              switch (err.xhr.status) {
                case 401:
                  //unauthorised
                  break;
                default:
                  log("login:submit: " + err.xhr.status + " " + err.thrownError + ".", 'e');
              }

              var response = '';
              if (err.xhr.responseText && (err.xhr.responseText == "Missing name parameter" || err.xhr.responseText.indexOf('Bad') >= 0)) {
                response = 'Bad Username or Password';
              } else {
                response = err.xhr.responseText;
              }

              App.regions.dialog.error({message: response});
              return;
            }

            App.regions.dialog.hideLoader();
            window.history.back();
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
    login: function (data, callback) {
      log('views.login: start.', 'd');
      var person = {
        //user logins
        'email': data.email,
        'password': data.password,

        //app logins
        'appname': CONFIG.morel.manager.appname,
        'appsecret': CONFIG.morel.manager.appsecret
      };

      $.ajax({
        url: CONFIG.login.url,
        type: 'POST',
        data: person,
        callback_data: person,
        dataType: 'text',
        timeout: CONFIG.login.timeout,
        success: function (data) {
          var details = API.extractUserDetails(data);
          details.email = person.email;
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
        log('login:extractdetails: problems with received secret.', 'w');
        return null;
      }
    }
  };

export { API as default };
