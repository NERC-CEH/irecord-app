import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import AppHeader from 'Components/Header';
import TaxonSearch, { TaxonSearchFilters } from 'Components/TaxonSearch';
import Sample from 'sample';
import Occurrence from 'occurrence';
import surveyConfig from 'common/config/surveys/complex/default';
import { IonPage, NavContext } from '@ionic/react';
import AppMain from 'Components/Main';
import { success } from 'helpers/toast';

@observer
class Controller extends React.Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    appModel: PropTypes.object,
    savedSamples: PropTypes.array.isRequired,
  };

  static contextType = NavContext;

  constructor(props) {
    super(props);

    const { id, smpId } = this.props.match.params;
    this.surveySample = this.props.savedSamples.find(({ cid }) => cid === id);
    const subSample = this.surveySample.samples.find(
      ({ cid }) => cid === smpId
    );
    this.state = {
      subSample,
    };
  }

  getNewSample = async taxon =>
    surveyConfig.smp.create(Sample, Occurrence, taxon, this.surveySample);

  onSpeciesSelected = async (taxon, editBtnClicked) => {
    const { match, history } = this.props;
    const { subSample } = this.state;
    const isNew = !subSample;

    const occID = match.params.occId;

    if (isNew) {
      const newSubSample = await this.getNewSample(taxon);
      if (editBtnClicked) {
        const url = match.url.replace('/new', '');
        history.replace(`${url}/${newSubSample.cid}`);
        return;
      }

      let name = taxon.scientific_name;
      if (taxon.found_in_name >= 0) {
        name = taxon.common_names[taxon.found_in_name];
      }

      success(`${t('Added')} ${name}`, 500);
      return;
    }

    if (occID) {
      const occ = subSample.occurrences.find(({ cid }) => cid === occID);
      subSample.removeOldTaxonAttributes(occ, taxon);
      occ.attrs.taxon = taxon;
    } else {
      const [occ] = subSample.occurrences;
      subSample.removeOldTaxonAttributes(occ, taxon);

      occ.attrs.taxon = taxon;
      await occ.save();
    }

    this.context.goBack();
  };

  render() {
    const { appModel } = this.props;
    const { subSample } = this.state;

    const isNew = !subSample;

    const searchNamesOnly = appModel.get('searchNamesOnly');
    const selectedFilters = appModel.get('taxonGroupFilters');

    return (
      <IonPage>
        <AppHeader
          title={t('Species')}
          rightSlot={<TaxonSearchFilters appModel={appModel} />}
        />
        <AppMain>
          <TaxonSearch
            onSpeciesSelected={this.onSpeciesSelected}
            showEditButton={isNew}
            informalGroups={selectedFilters}
            namesFilter={searchNamesOnly}
            resetOnSelect
          />
        </AppMain>
      </IonPage>
    );
  }
}

export default Controller;
