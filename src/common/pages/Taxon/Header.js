import React from 'react';
import PropTypes from 'prop-types';
import radio from 'radio';
import CommonHeader from 'common/Components/Header';
import Log from 'helpers/log';
import { observer } from 'mobx-react';
import FiltersView from './filters_view';

function showFiltersDialog(appModel) {
  const filtersView = new FiltersView({ model: appModel });
  filtersView.on('filter:taxon', filter => {
    if (!filter) {
      Log('Taxon:Controller: No filter provided', 'e');
      return;
    }
    Log('Taxon:Controller: Filter set');
    appModel.toggleTaxonFilter(filter);
  });

  filtersView.on('filter:name', filter => {
    Log('Taxon:Controller: Filter for name set');
    appModel.set('searchNamesOnly', filter);
    appModel.save();
  });

  radio.trigger('app:dialog', {
    title: 'Filter',
    body: filtersView,
    buttons: [
      {
        title: 'Close',
        onClick() {
          radio.trigger('app:dialog:hide');
        },
      },
    ],
  });
}

const Header = observer(({ appModel, disableFilters }) => {
  const filters = appModel.get('taxonGroupFilters');
  const filterOn = filters.length || appModel.get('searchNamesOnly');

  const filtersButton = disableFilters ? null : (
    <button
      id="filter-btn"
      onClick={() => showFiltersDialog(appModel)}
      className={`icon icon-filter ${filterOn ? 'on' : ''} `}
    />
  );

  return <CommonHeader rightPanel={filtersButton}>{t('Species')}</CommonHeader>;
});

Header.propTypes = {
  appModel: PropTypes.object.isRequired,
  disableFilters: PropTypes.bool,
};

export default Header;
