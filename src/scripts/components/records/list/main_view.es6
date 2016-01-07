/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'common/user_model',
  'marionette',
  'morel',
  'JST',
  'log',
  'hammerjs',
  'helpers/browser',
  'common/record_manager',
  'helpers/date_extension'
], function (user, Marionette, morel, JST, log, Hammer, browser) {
  'use strict';

  let RecordView = Marionette.ItemView.extend({
    tagName: 'li',
    className: 'table-view-cell',

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

    initialize: function () {
      this.template = JST['records/list/record' + (browser.isMobile() ? '_mobile': '')];
    },

    render: function () {
      let occ = this.model.occurrences.at(0);
      let date = this.model.get('date').print(),
          specie = occ.get('taxon'),
          images = occ.images;
      let img = images.length && images.at(0).get('data');

      let taxon = user.get('useScientificNames') ?
        specie.taxon : specie.common_name || specie.taxon;

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

      this.onRender();
    },

    onRender: function () {
      //early return
      if (!browser.isMobile()) return;

      this.$record = this.$el.find('a');
      this.docked = false;
      this.position = 0;

      var options = {
        threshold: 50,
        toolsWidth: 100
      };

      var hammertime = new Hammer(this.el, {direction: Hammer.DIRECTION_HORIZONTAL});
      var that = this;

      //on tap bring back
      this.$record.on('tap click', $.proxy(this._swipeHome, this));

      hammertime.on('pan', function(e) {
        e.preventDefault();
        that._swipe(e, options);
      });
      hammertime.on('panend', function(e) {
        that._swipeEnd(e, options);
      });

    },

    _swipe: function (e, options) {
      if (this.docked) {
        this.position = -options.toolsWidth + e.deltaX;
      } else {
        this.position = e.deltaX;
      }

      //protection of swipeing right too much
      if (this.position > 0) this.position = 0;

      this.$record.css('transform', 'translateX(' + this.position + 'px)');
    },

    _swipeEnd: function (e, options) {
      // if (e.deltaX > options.threshold) {
      if ((-options.toolsWidth + e.deltaX) > -options.toolsWidth) {
        //bring back
        this.position = 0;
        this.docked = false;
      } else {
        //open tools
        this.docked = true;
        this.position = -options.toolsWidth;
      }

      this.$record.css('transform', 'translateX(' + this.position + 'px)');
    },

    _swipeHome: function (e) {
      if (this.docked) {
        e.preventDefault();
        this.position = 0;
        this.$record.css('transform', 'translateX(' + this.position + 'px)');
        this.docked = false;
      }
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
