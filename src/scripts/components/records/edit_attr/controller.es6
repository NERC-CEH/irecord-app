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
      recordManager.get(recordID, function (err, record) {
        if (!record) {
          App.trigger('404:show');
          return;
        }

        let occ = record.occurrences.at(0);
        let templateData = new Backbone.Model();
        switch (attr) {
          case 'date':
            templateData.set('date', record.get('date').toDateInputValue())
            break;
          case 'number':
            templateData.set(occ.get('number'), true);
            break;
          case 'stage':
            templateData.set(occ.get('stage'), true);
            break;
          case 'comment':
            templateData.set('comment', occ.get('comment'));
            break;
          default:
            App.trigger('404:show');
            return;
        };

        //can't edit a saved one - to be removed when record update
        //is possible on the server
        if (record.metadata.saved) {
          App.trigger('records:show', recordID);
          return;
        }

        //MAIN
        let mainView = new MainView({
          attr: attr,
          model: templateData
        });
        App.regions.main.show(mainView);

        let onExit = function () {
          let values = mainView.getValues();
          switch (attr) {
            case 'date':
              record.set('date', values.date);
              break;
            case 'number':
              occ.set('number', values.number);
              break;
            case 'stage':
              occ.set('stage', values.stage);
              break;
            case 'comment':
              occ.set('comment', values.comment);
              break;
            default:
          }
          record.save(function () {
            //update locked value if attr is locked
            if (appModel.getAttrLock(attr)) {
              appModel.setAttrLock(attr, values[attr]);
            }

            window.history.back();
          })
        };

        //HEADER
        let lockView = new LockView({
          model: appModel,
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
          rightPanel: lockView
        });

        App.regions.header.show(headerView);

        //if exit on selection click
        mainView.on('save', onExit);
      });
    }
  };

  return API;
});