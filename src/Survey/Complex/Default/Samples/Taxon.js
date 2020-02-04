import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import AppHeader from 'Components/Header';
import TaxonSearch, { TaxonSearchFilters } from 'Components/TaxonSearch';
import modelFactory from 'model_factory';
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

  getNewSample = async taxon => {
    const newSubSample = await modelFactory.createComplexDefaultSubSample({
      taxon,
    });

    this.surveySample.samples.push(newSubSample);
    await this.surveySample.save();

    return newSubSample;
  };

  render() {
    const { match, history, appModel } = this.props;
    const { subSample } = this.state;

    const occID = match.params.occId;

    const isNew = !subSample;

    const onSpeciesSelected = async (taxon, editBtnClicked) => {
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
        const occurrence = subSample.occurrences.find(occ => occ.cid === occID);
        occurrence.attrs.taxon = taxon;
      } else {
        const [occ] = subSample.occurrences;
        occ.attrs.taxon = taxon;
        await occ.save();
      }

      this.context.goBack();
    };

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
            onSpeciesSelected={onSpeciesSelected}
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
