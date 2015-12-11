/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'JST',
  'log',
  'app',
  'data/master_list',
  'data/master_list_1',
  'data/master_list_2',
  'data/master_list_3',
], function (Marionette, JST, log, app) {
  'use strict';

  let View = Marionette.LayoutView.extend({
    template: JST['common/taxon/layout'],

    events: {
      'keydown #taxon': '_keydown'
    },

    regions: {
      suggestions: '#suggestions'
    },

    initialize: function (options){
      this.removeEditBtn = options.removeEditBtn;
      this.selectedIndex = 0;
    },

    onRender: function () {
      this.$el.find('#taxon').select();
    },

    _keydown: function (e) {
      let input = e.target.value;
      if (!input) {
        return;
      }

      switch (e.keyCode) {
        case 13:
          //press Enter
          e.preventDefault();

          //exit if no suggestions
          if (this.selectedIndex < 0) return;

          //find which one is currently selected
          let selectedModel = this.suggestionsCol.at(this.selectedIndex);

          let speciesID = selectedModel.get('name');
          this.trigger('taxon:selected', speciesID, false);

          return false;
        case 38:
          //Up
          e.preventDefault();

          if (this.selectedIndex > 0) {
            this.suggestionsCol.at(this.selectedIndex).set('selected', false);
            this.selectedIndex--;
            this.suggestionsCol.at(this.selectedIndex).set('selected', true);
          }
          //rerender
          break;
        case 40:
          //Down
          e.preventDefault();

          if ((this.suggestionsCol && this.suggestionsCol.length) && //initialized
            this.selectedIndex < this.suggestionsCol.length - 1) { //not out of boundaries
            this.suggestionsCol.at(this.selectedIndex).set('selected', false);
            this.selectedIndex++;
            this.suggestionsCol.at(this.selectedIndex).set('selected', true);
          }
          break;
        default:
          this.suggestionsCol = this.getSuggestions(input);

          //reset selection
          this.selectedIndex = this.suggestionsCol.length > 0 ? 0 : -1;

          //select first
          this.suggestionsCol.length && this.suggestionsCol.at(0).set('selected', true);

          let suggestionsColView = new SuggestionsView({
            collection: this.suggestionsCol
          });
          suggestionsColView.on('childview:taxon:selected',
            (view, speciesID, edit) => this.trigger('taxon:selected', speciesID, edit));

          this.suggestions.show(suggestionsColView);

      }
    },

    getSuggestions: function (input) {
      log('taxon: generating suggestions.', 'd');

      let MAX = 20;
      let text = input.toLowerCase(),
          selection = [];

      for (var listID = 0; listID < 4 && selection.length < MAX; listID++) {
        var species = window['species_' + listID];
        for (var i = 0; i < species.length && selection.length < MAX; i++) {
          var s = species[i][1].toLowerCase().indexOf(text);
          if (s >= 0) {
            selection.push({
              name: species[i][1],
              removeEditBtn: this.removeEditBtn
            });
          }
        }
      }

      return new Backbone.Collection(selection);
    }

  });

  let SpeciesView = Marionette.ItemView.extend({
    tagName: 'li',
    className: function () {
      return 'table-view-cell ' + (this.model.get('selected') ? 'selected' : '');
    },

    template: JST['common/taxon/species'],

    events: {
      'click': 'select'
    },

    attributes: function () {
      return {
        'data-name': this.model.get('name')
      };
    },

    modelEvents: {'change': 'render'},

    onRender: function() {
      //have to manually repaint
      this.$el.removeClass().addClass(this.className());
    },

    select: function (e) {
      log('taxon: selected.', 'd');
      let speciesID = e.target.dataset.name;
      let edit = false;

      if (!speciesID) {
        speciesID = e.target.parentElement.dataset.name;
        edit = true;
      }
      this.trigger('taxon:selected', speciesID, edit);
    }
  });

  let SuggestionsView = Marionette.CollectionView.extend({
    tagName: 'ul',
    className: 'table-view',
    childView: SpeciesView
  });

  return View;
});
