/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'log',
  'JST',
  'data/informal_groups'
], function (Marionette, Log, JST, informalGroups) {
  'use strict';

  const MIN_SEARCH_LENGTH = 2;

  let View = Marionette.LayoutView.extend({
    template: JST['common/taxon/layout'],

    events: {
      'keydown #taxon': '_keydown',
      'keyup #taxon': '_keyup',
      'click .delete': 'deleteSearch'
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

    /**
     * Clear the search input
     */
    deleteSearch: function () {
      this.$el.find('#taxon').val('');
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
      let that = this;
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

          let species = selectedModel.toJSON();
          delete species.selected;
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
          let text = input;

          //on keyDOWN need to add the pressed char
          let pressedChar = String.fromCharCode(e.keyCode);
          if (e.keyCode != 8) {
            //http://stackoverflow.com/questions/19278037/javascript-non-unicode-char-code-to-unicode-character
            if (e.keyCode === 189 || e.keyCode === 109){
              pressedChar = '-';
            }
            if (e.keyCode === 190){
              pressedChar = '.';
            }

            text += pressedChar;
          } else {
            //Backspace - remove a char
            text =  text.slice(0, text.length - 1);
          }

          //proceed if minimum length phrase was provided
          if ((text.replace(/\.|\s/g,'').length)>= MIN_SEARCH_LENGTH) {
            text = text.trim();

            // Clear previous timeout
            if (this.timeout != -1) {
              clearTimeout(this.timeout);
            }

            // Set new timeout - don't run if user is typing
            this.timeout = setTimeout(function () {
              //let controller know
              that.trigger('taxon:searched', text.toLowerCase());
            }, 100);
          }
      }
    },

    _keyup: function (e) {
      let that = this;
      let input = e.target.value;
      if (!input) {
        return;
      }

      switch (e.keyCode) {
        case 13:
          //press Enter
        case 38:
          //Up
        case 40:
          //Down
          break;
        default:
          //Other
          let text = input;

          //proceed if minimum length phrase was provided
          if ((text.replace(/\.|\s/g,'').length)>= MIN_SEARCH_LENGTH) {
            text = text.trim();

            // Clear previous timeout
            if (this.timeout != -1) {
              clearTimeout(this.timeout);
            }

            // Set new timeout - don't run if user is typing
            this.timeout = setTimeout(function () {
              //let controller know
              that.trigger('taxon:searched', text.toLowerCase());
            }, 100);
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
      let taxon = this.model.get('scientific_name');
      let common_name = this.model.get('common_name');
      let foundInName = this.model.get('found_in_name');

      let name = this._prettifyName(this.model.get(foundInName), this.options.searchPhrase);
      name = this.model.get(foundInName);
      return {
        name: name,
        removeEditBtn: this.options.removeEditBtn,
        group: informalGroups[this.model.get('group') - 1]
      };
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
      let edit = e.target.tagName == "BUTTON";
      let species = this.model.toJSON();
      delete species.selected;

      this.trigger('taxon:selected', species, edit);
    }
  });

  let NoSuggestionsView = Marionette.ItemView.extend({
    tagName: 'li',
    className: 'table-view-cell empty',
    template: _.template('No species found with this name')
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
