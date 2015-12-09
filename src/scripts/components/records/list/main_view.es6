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

    triggers: {
      'click #delete': 'record:delete'
    },

    events: {
      //need to pass the attribute therefore 'triggers' method does not suit
      'click .js-attr': function (e) {
        e.preventDefault();
        this.trigger('record:edit:attr', $(e.target).data('attr'))
      }
    },

    render: function () {
      let occ = this.model.occurrences.at(0);
      let date = this.model.get('date').print(),
          taxon = occ.get('taxon'),
          images = occ.images;
      let img = images.length && images.at(0).get('data');
      let templateData = {
        id: this.model.id || this.model.cid,
        saved: this.model.metadata.saved,
        onDatabase: this.model.getSyncStatus() === morel.SYNCED,
        date: date,
        taxon: taxon,
        number: occ.get('number') && occ.get('number').limit(20),
        stage: occ.get('stage') && occ.get('stage').limit(20),
        comment: occ.get('comment'),
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
