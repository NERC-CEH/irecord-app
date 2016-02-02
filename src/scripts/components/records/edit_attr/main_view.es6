/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'log',
  'JST'
], function (Marionette, Log, JST) {
  'use strict';

  let View = Marionette.ItemView.extend({
    initialize: function (options) {
      this.template =  JST['records/edit_attr/' + options.attr];
    },

    triggers: function () {
      switch (this.options.attr) {
        case 'stage':
        //fallthrough
        case 'number':
          return {
            'click input': 'save'
          };
          break;
        default:
      }
    },

    getValues: function () {
      let values = {},
          value,
          attr = this.options.attr,
          $inputs;
      switch (attr) {
        case 'date':
          value = this.$el.find('input').val();
          values[attr] = new Date(value);
          break;
        case 'number':
          $inputs = this.$el.find('input');
          $inputs.each(function () {
            if ($(this).prop('checked')) {
              values[attr] = $(this).val();
            }
          });
          break;
        case 'stage':
          $inputs = this.$el.find('input');
          $inputs.each(function () {
            if ($(this).prop('checked')) {
              values[attr] = $(this).val();
            }
          });
          break;
        case 'comment':
          value = this.$el.find('textarea').val();
          values[attr] = value.escape();
          break;
        default:
      }

      return values;
    },

    serializeData:  function () {
      let templateData = {};
      switch (attr) {
        case 'date':
          templateData.date = recordModel.get('date').toDateInputValue();
          break;
        case 'number':
          templateData[occ.get('number')] = true;
          break;
        case 'stage':
          templateData[occ.get('stage')] =  true;
          break;
        case 'comment':
          templateData.comment = occ.get('comment');
          break;
        default:
          Log('No such attribute', 'e');
          return;
      };

      return templateData
    }

  });

  return View;
});
