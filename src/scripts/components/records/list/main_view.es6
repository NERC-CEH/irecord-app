/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'morel',
  'JST',
  'log',
  'common/record_manager',
  'helpers/date_extension'
], function (Marionette, morel, JST, log) {
  'use strict';

  let RecordView = Marionette.ItemView.extend({
    tagName: 'li',
    className: 'table-view-cell',
    template: JST['records/list/record'],

    render: function () {
      let occ = this.model.occurrences.getFirst();
      let date = this.model.get('date').print(),
          taxon = occ.get('taxon'),
          images = occ.images;
      let img = images.length && images.getFirst().data;
      let templateData = {
        id: this.model.id,
        saved: this.model.metadata.saved,
        onDatabase: this.model.getSyncStatus() === morel.SYNCED,
        date: date,
        taxon: taxon,
        img: img ? '<img src="' + img + '"/>' : ''
      };
      this.$el.html(this.template(templateData));
    }
  });

  let NoRecordsView = Marionette.ItemView.extend({
    tagName: 'li',
    className: 'table-view-cell empty',
    template: JST['records/list/list-none']
  });

  let View = Marionette.CollectionView.extend({
    id: 'records-list',
    tagName: 'ul',
    className: 'table-view no-top',
    emptyView: NoRecordsView,
    childView: RecordView,

    //inverse the collection
    attachHtml: function(collectionView, childView, index){
      collectionView.$el.prepend(childView.el);
    }
  });

  return View;
});
