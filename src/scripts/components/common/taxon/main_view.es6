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
      'input #taxon': 'updateSuggestions'
    },

    regions: {
      suggestions: '#suggestions'
    },

    initialize: function (options){
      this.removeEditBtn = options.removeEditBtn;
    },

    updateSuggestions: function (e) {
      log('taxon: updating suggestions.', 'd');

      let input = e.target.value;
      if (!input) {
        return;
      }

      let likelySpecies = this.getSuggestions(input);

      let suggestions = new SuggestionsView({
        collection: likelySpecies
      });
      this.suggestions.show(suggestions);
    },

    getSuggestions: function (input) {
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
    className: 'table-view-cell',
    template: JST['common/taxon/species'],

    events: {
      'click': 'select'
    },

    attributes: function () {
      return {
        'data-name': this.model.get('name')
      };
    },

    select: function (e) {
      log('taxon: selected.', 'd');
      let speciesID = e.target.dataset.name;
      let edit = false;

      if (!speciesID) {
        speciesID = e.target.parentElement.dataset.name;
        edit = true;
      }
      app.trigger('common:taxon:selected', speciesID, edit);
    }
  });

  let SuggestionsView = Marionette.CollectionView.extend({
    tagName: 'ul',
    className: 'table-view',
    childView: SpeciesView
  });

  return View;
});
