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
      mainView.on('register', function (data) {
        if (!navigator.onLine) {
          App.regions.dialog.show({
            title: 'Sorry',
            body: 'Looks like you are offline!'
          });
          return;
        }

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
              response = err.thrownError;
            }

            App.regions.dialog.error({message: response});
            return;
          }
          App.regions.dialog.hideLoader();

          window.history.back();
        });
      })

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

  return API;
});