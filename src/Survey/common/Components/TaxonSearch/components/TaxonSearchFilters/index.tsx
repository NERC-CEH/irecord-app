import { useState } from 'react';
import { Trans as T } from 'react-i18next';
import appModel from 'models/app';
import HeaderButton from 'Survey/common/Components/HeaderButton';
import FiltersModal from './FiltersModal';
import './styles.scss';

const Header = () => {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => setShowModal(!showModal);

  const onSearchNamesFilterSelect = (filter: '' | 'scientific' | 'common') => {
    if (filter === appModel.data.searchNamesOnly) {
      return;
    }
    appModel.data.searchNamesOnly = filter;
    appModel.save();
  };

  const isFiltering =
    appModel.data.searchNamesOnly ||
    appModel.data.taxonSearchGroupFilters.length;

  const filtersCount =
    (appModel.data.searchNamesOnly ? 1 : 0) +
    appModel.data.taxonSearchGroupFilters.length;

  const onSearchTaxaFilterSelect = (newFilters: number[][]) => {
    appModel.data.taxonSearchGroupFilters = newFilters;
    appModel.save();
  };

  return (
    <>
      <FiltersModal
        onTaxaFilterChange={onSearchTaxaFilterSelect}
        onNameFilterChange={onSearchNamesFilterSelect}
        toggleModal={toggleModal}
        showModal={showModal}
      />
      <HeaderButton
        onClick={toggleModal}
        className="filter-button"
        color={isFiltering ? 'warning' : undefined}
        fill="outline"
        skipTranslation
      >
        <T>Filters</T> {!!isFiltering && <b>({filtersCount})</b>}
      </HeaderButton>
    </>
  );
};

export default Header;
