import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  IonItemDivider,
  IonButtons,
  IonToolbar,
  IonHeader,
  IonTitle,
  IonButton,
  IonModal,
  IonRadio,
  IonCheckbox,
  IonLabel,
  IonItem,
  IonRadioGroup,
} from '@ionic/react';
import AppMain from 'Components/Main';
import informalGroups from 'common/data/informal_groups.data';
import './styles.scss';

export default class Header extends Component {
  static propTypes = {
    appModel: PropTypes.object.isRequired,
  };

  state = {
    showModal: false,
  };

  getFiltersModal = () => {
    const { appModel } = this.props;
    const { showModal } = this.state;

    const filters = Object.keys(informalGroups)
      .sort((a, b) => t(informalGroups[a]).localeCompare(t(informalGroups[b])))
      .map(id => ({ id, label: informalGroups[id] }));

    const searchNamesOnly = appModel.get('searchNamesOnly');
    const selectedFilters = appModel.get('taxonGroupFilters');

    // showFilterDialog(filters, selectedFilters, searchNamesOnly)}

    const filtersList = filters.map((_, i) => (
      <IonItem>
        <IonLabel class="filter-label">{t(filters[i].label)}</IonLabel>
        <IonCheckbox
          value={filters[i].id}
          onIonChange={this.onSearchTaxaFilterSelect}
          checked={selectedFilters.indexOf(parseInt(filters[i].id, 10)) >= 0}
        />
      </IonItem>
    ));

    const form = (
      <div id="filters-dialog-form">
        <IonItemDivider>{t('Names:')}</IonItemDivider>
        <IonRadioGroup
          value={searchNamesOnly || ''}
          className="taxa-filter-edit-dialog-form"
          onIonSelect={this.onSearchNamesFilterSelect}
        >
          <IonItem>
            <IonLabel>{t('Default')}</IonLabel>
            <IonRadio value="" />
          </IonItem>
          <IonItem>
            <IonLabel>{t('Common only')}</IonLabel>
            <IonRadio value="common" />
          </IonItem>
          <IonItem>
            <IonLabel>{t('Scientific only')}</IonLabel>
            <IonRadio value="scientific" />
          </IonItem>
        </IonRadioGroup>

        <div className="taxon-groups taxa-filter-edit-dialog-form">
          <IonItemDivider>{t('Taxon groups:')}</IonItemDivider>
          {filtersList}
        </div>
      </div>
    );

    return (
      <IonModal isOpen={showModal}>
        <IonHeader translucent>
          <IonToolbar>
            <IonTitle>Filters</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={this.toggleModal}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <AppMain fullscreen>{form}</AppMain>
      </IonModal>
    );
  };

  toggleModal = () => {
    this.setState({ showModal: !this.state.showModal });
  };

  onSearchNamesFilterSelect = e => {
    const { appModel } = this.props;
    const filter = e.target.value;
    if (filter === appModel.attrs.searchNamesOnly) {
      return;
    }
    appModel.set('searchNamesOnly', filter);
    appModel.save();
  };

  onSearchTaxaFilterSelect = e => {
    const { appModel } = this.props;

    const filter = parseInt(e.target.value, 10);
    appModel.toggleTaxonFilter(filter);
  };

  render() {
    const { appModel } = this.props;

    const isFiltering =
      appModel.attrs.searchNamesOnly || appModel.attrs.taxonGroupFilters.length;

    return (
      <>
        {this.getFiltersModal()}
        <IonButton
          onClick={this.toggleModal}
          color={isFiltering ? 'tertiary' : ''}
        >
          {t('Filter')}
        </IonButton>
      </>
    );
  }
}
