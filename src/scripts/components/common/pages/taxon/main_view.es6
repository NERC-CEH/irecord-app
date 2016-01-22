/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'log',
  'JST'
], function (Marionette, Log, JST) {
  'use strict';

  const MIN_SEARCH_LENGTH = 2;

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

    updateSuggestions: function (suggestions, searchPhrase) {
      this.suggestionsCol = suggestions;

      //reset selection
      this.selectedIndex = this.suggestionsCol.length > 0 ? 0 : -1;

      //select first
      this.suggestionsCol.length && this.suggestionsCol.at(0).set('selected', true);

      let suggestionsColView = new SuggestionsView({
        collection: this.suggestionsCol,
        removeEditBtn: this.options.removeEditBtn,
        searchPhrase: searchPhrase
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

          let species = {
            warehouse_id: selectedModel.get('warehouse_id'),
            common_name: selectedModel.get('common_name'),
            taxon: selectedModel.get('taxon')
          };
          this.trigger('taxon:selected', species, false);

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
          let text = input.trim();
          //on keyDOWN need to add the pressed char

          let pressedChar = String.fromCharCode(e.keyCode);
          if (e.keyCode != 8){
            //ignore backspace
            text += pressedChar;
          } else {
            text =  text.slice(0, text.length - 1);
          }
          if ((text.length)>= MIN_SEARCH_LENGTH) {
            this.trigger('taxon:searched', text.toLowerCase());
          }
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
        'data-warehouse_id': this.model.get('warehouse_id'),
        'data-common_name': this.model.get('common_name'),
        'data-taxon': this.model.get('taxon'),
      };
    },

    modelEvents: {'change': 'render'},

    /**
     * Prepare search results for the view
     * @returns {{}}
     */
    serializeData: function () {
      let templateData = {};
      let taxon = this.model.get('taxon');
      let common_name = this.model.get('common_name');

      //check if found in taxon
      let common_pos = common_name.toLowerCase().indexOf(this.options.searchPhrase);
      if (common_pos >= 0 ) {
        templateData.name = this._prettifyName(common_name, this.options.searchPhrase);
      } else {
        templateData.name = this._prettifyName(taxon, this.options.searchPhrase);
      }

      templateData.removeEditBtn = this.options.removeEditBtn;

      return templateData;
    },

    _prettifyName: function (name, searchPhrase) {
      let search_pos = name.toLowerCase().indexOf(searchPhrase);
      let prettyName = name.slice(0, search_pos) + '<b>' +
        name.slice(search_pos, search_pos + searchPhrase.length) + '</b>' +
        name.slice(search_pos + searchPhrase.length);

      return prettyName;
    },

    onRender: function() {
      //have to manually repaint
      this.$el.removeClass().addClass(this.className());
    },

    select: function (e) {
      Log('taxon: selected.', 'd');
      let edit = false;

      let species = {
        warehouse_id: e.target.dataset.warehouse_id,
        common_name: e.target.dataset.common_name,
        taxon: e.target.dataset.taxon
      };

      if (!species.warehouse_id) {
        species = {
          warehouse_id: e.target.parentElement.dataset.warehouse_id,
          common_name: e.target.parentElement.dataset.common_name,
          taxon: e.target.parentElement.dataset.taxon
        };

        edit = true;
      }
      this.trigger('taxon:selected', species, edit);
    }
  });

  let NoSuggestionsView = Marionette.ItemView.extend({
    tagName: 'li',
    className: 'table-view-cell empty',
    template: JST['common/taxon/list-none']
  });

  let SuggestionsView = Marionette.CollectionView.extend({
    tagName: 'ul',
    className: 'table-view',
    emptyView: NoSuggestionsView,
    childView: SpeciesView,
    childViewOptions: function () {
      return {
        removeEditBtn: this.options.removeEditBtn,
        searchPhrase: this.options.searchPhrase
      }
    }
  });

  return View;
});
