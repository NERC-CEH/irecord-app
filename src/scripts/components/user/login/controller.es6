define([
  'app',
  'log',
  'app-config',
  'common/user_model',
  './main_view',
  'common/header_view'
], function (App, Log, CONFIG, userModel, MainView, HeaderView) {
  let API = {
    show: function () {
      let mainView = new MainView();
      App.regions.main.show(mainView);

      let headerView = new HeaderView({
        model: new Backbone.Model({
          title: 'Login'
        })
      });
      App.regions.header.show(headerView);

      mainView.on('login', function (email, password) {
        App.regions.dialog.showLoader();

        API.login(email, password, function (err, data) {
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
              response = err.xhr.responseText;
            }

            App.regions.dialog.error({message: response});
            return;
          }

          App.regions.dialog.hideLoader();
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
      Log('views.login: start.', 'd');
      var person = {
        //user logins
        'email': email,
        'password': password,

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
        Log('login:extractdetails: problems with received secret.', 'w');
        return null;
      }
    },

    /**
     * Logs the user out of the system.
     */
    logout: function () {
      userModel.logOut();
    },

    /**
     * Brings the state of the user being logged in.
     * @returns boolean true if the user is logged in, or false if not
     */
    getLoginState: function () {
      return userModel.hasLogIn();
    }
  };

  return API;
});