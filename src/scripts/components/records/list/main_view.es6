/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'JST',
  'log'
], function (Marionette, JST, log) {
  'use strict';

  let RecordView = Marionette.ItemView.extend({
    tagName: 'li',
    className: 'table-view-cell',
    template: JST['records/list/record'],

    render: function () {
      let date = this.model.get('date'),
          taxon = this.model.occurrences.getFirst().get('taxon'),
          images = this.model.occurrences.getFirst().images;
      let img = images.length && images.getFirst().data;
      let templateData = {
        id: this.model.id,
        date: date,
        taxon: taxon,
        img: img ? '<img src="' + img + '"/>' : ''
      };
      this.$el.html(this.template(templateData));
    }
  });

  let NoRecordsView = Marionette.ItemView.extend({
    tagName: 'li',
    className: 'table-view-cell alert',
    template: JST['records/list/list-none']
  });

  let View = Marionette.CollectionView.extend({
    id: 'records-list',
    tagName: 'ul',
    className: 'table-view',
    emptyView: NoRecordsView,
    childView: RecordView
  });

  return View;
});
