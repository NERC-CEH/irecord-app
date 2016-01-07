/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'JST',
  'log',
  'app'
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

    initialize: function (){
      this.selectedIndex = 0;
    },

    onRender: function () {
      //preselect the input for typing
      this.$el.find('#taxon').select();
    },

    updateSuggestions: function (suggestions) {
      this.suggestionsCol = suggestions;

      //reset selection
      this.selectedIndex = this.suggestionsCol.length > 0 ? 0 : -1;

      //select first
      this.suggestionsCol.length && this.suggestionsCol.at(0).set('selected', true);

      let suggestionsColView = new SuggestionsView({
        collection: this.suggestionsCol,
        removeEditBtn: this.options.removeEditBtn
    });
      suggestionsColView.on('childview:taxon:selected',
        (view, speciesID, edit) => this.trigger('taxon:selected', speciesID, edit));

      this.suggestions.show(suggestionsColView);
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
          //Other

          //check time difference

          //let controller know
          let text = input.toLowerCase();
          this.trigger('taxon:searched', text);
      }
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

    serializeData: function () {
      let templateData = {};
      templateData.name = this.model.get('name');
      templateData.removeEditBtn = this.options.removeEditBtn;

      return templateData;
    },

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
    childView: SpeciesView,
    childViewOptions: function () {
      return {
        removeEditBtn: this.options.removeEditBtn
      }
    }
  });

  return View;
});
