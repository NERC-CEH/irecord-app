define([
  'app',
  'log',
  'helpers/dialog',
  'helpers/validate',
  'app-config',
  'common/models/user',
  './main_view',
  'common/header_view'
], function (app, log, dialog, validate, CONFIG, user, MainView, HeaderView) {
  let API = {
    show: function () {
      let mainView = new MainView();
      app.regions.main.show(mainView);

      let headerView = new HeaderView({
        model: new Backbone.Model({
          pageName: 'Login'
        })
      });
      app.regions.header.show(headerView);

      mainView.on('login:submit', function (email, password) {
        dialog.showLogin();

        API.login(email, password, function (err, data) {
          if (err) {
            switch (err.xhr.status) {
              case 401:
                //unauthorised
                break;
              default:
                log("login:submit: " + err.xhr.status + " " + err.thrownError + ".", 'e');
            }

            var response = '';
            if (err.xhr.responseText == "Missing name parameter" || err.xhr.responseText.indexOf('Bad') >= 0) {
              response = 'Bad Username or Password';
            } else {
              response = err.xhr.responseText;
            }

            dialog.error({message: response});
            return;
          }

          dialog.hide();
          window.history.back();
        });
      })
    },

    /**
     * Starts an app sign in to the Drupal site process.
     * The sign in endpoint is specified by CONFIG.login.url -
     * should be a Drupal sight using iForm Mobile Auth Module.
     *
     * It is important that the app authorises itself providing
     * appname and appsecret for the mentioned module.
     */
    login: function (email, password, callback) {
      log('views.login: start.', 'd');
      var person = {
        //user logins
        'email': email,
        'password': password,

        //app logins
        'appname': CONFIG.morel.manager.appname,
        'appsecret': CONFIG.morel.manager.appsecret
      };

      if (validate.email(person.email)) {
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
            user.logIn(details);

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

      } else {
        callback({xhr: {responsetext: 'Invalid Email'}});
      }
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
    },

    /**
     * Logs the user out of the system.
     */
    logout: function () {
      user.logOut();
    },

    /**
     * Brings the state of the user being logged in.
     * @returns boolean true if the user is logged in, or false if not
     */
    getLoginState: function () {
      return user.hasLogIn();
    }
  };

  return API;
});