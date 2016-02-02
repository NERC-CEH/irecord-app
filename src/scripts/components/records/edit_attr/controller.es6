define([
  'date_extension',
  'app',
  'common/app_model',
  './main_view',
  'common/header_view',
  'common/attr_lock_view',
  'common/record_manager',
], function (Date, App, appModel, MainView, HeaderView, LockView, recordManager) {
  let API =  {
    show: function (recordID, attr) {
      recordManager.get(recordID, function (err, recordModel) {
        //Not found
        if (!recordModel) {
          App.trigger('404:show');
          return;
        }

        let occ = recordModel.occurrences.at(0);

        //can't edit a saved one - to be removed when record update
        //is possible on the server
        if (recordModel.metadata.saved) {
          App.trigger('records:show', recordID);
          return;
        }

        //MAIN
        let mainView = new MainView({
          attr: attr,
          model: recordModel
        });
        App.regions.main.show(mainView);

        let onExit = function () {
          let values = mainView.getValues();
          let currentVal;

          switch (attr) {
            case 'date':
              currentVal = recordModel.get('date');

              //validate before setting up
              if (values.date != 'Invalid Date') {
                recordModel.set('date', values.date);
              }
              break;
            case 'number':
              currentVal = occ.get('number');

              //don't save default values
              values.number = values.number === 'default' ? null : values.number;

              //validate before setting up

              occ.set('number', values.number);
              break;
            case 'stage':
              currentVal = occ.get('stage');

              //don't save default values
              values.stage = values.stage === 'default' ? null : values.stage;

              //validate before setting up

              occ.set('stage', values.stage);
              break;
            case 'comment':
              currentVal = occ.get('comment');

              //validate before setting up

              occ.set('comment', values.comment);
              break;
            default:
          }

          recordModel.save(function () {
            //update locked value if attr is locked
            let lockedValue = appModel.getAttrLock(attr);
            if (lockedValue) {
              if (values[attr] === 'default') {
                appModel.setAttrLock(attr, null);
              } else if (lockedValue === true || lockedValue == currentVal) {
                appModel.setAttrLock(attr, values[attr]);
              }
            }

            window.history.back();
          })
        };

        //HEADER
        let lockView = new LockView({
            model: new Backbone.Model({appModel:appModel, recordModel:recordModel}),
          attr: attr,
          onLockClick:function () {
            //invert the lock of the attribute
            //real value will be put on exit
            appModel.setAttrLock(attr, !appModel.getAttrLock(attr));
          }
        });

        //header view
        let headerView = new HeaderView({
          onExit: onExit,
          rightPanel: lockView,
          model: new Backbone.Model({title: attr})
        });

        App.regions.header.show(headerView);

        //if exit on selection click
        mainView.on('save', onExit);
      });
    }
  };

  return API;
});