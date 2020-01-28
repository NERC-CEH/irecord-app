import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import AppHeader from 'Components/Header';
import TaxonSearch, { TaxonSearchFilters } from 'Components/TaxonSearch';
import modelFactory from 'model_factory';
import { IonPage, NavContext } from '@ionic/react';
import AppMain from 'Components/Main';

@observer
class Controller extends React.Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    savedSamples: PropTypes.array.isRequired,
    userModel: PropTypes.object.isRequired,
    appModel: PropTypes.object.isRequired,
  };

  static contextType = NavContext;

  state = {
    sample: this.props.savedSamples.find(
      ({ cid }) => cid === this.props.match.params.id
    ),
  };

  async getNewSample(taxon) {
    const { savedSamples } = this.props;
    const sample = await modelFactory.createSample({
      taxon,
    });
    sample.save();
    savedSamples.push(sample);
    return sample;
  }

  render() {
    const { match, history, userModel, appModel } = this.props;
    const { sample } = this.state;

    const getUserFavouriteSpecies = () => {
      const { statistics } = userModel.attrs;
      if (!statistics || !statistics.species || !statistics.species.length) {
        return null;
      }
      return [...statistics.species];
    };

    const occID = match.params.occId;

    const isNew = !sample;

    const onSpeciesSelected = async (taxon, editBtnClicked) => {
      if (isNew) {
        const newSample = await this.getNewSample(taxon);
        if (editBtnClicked) {
          const url = match.url.replace('/new', '');
          history.replace(`${url}/${newSample.cid}/edit`);
          return;
        }
        window.history.back();
        return;
      }

      if (occID) {
        const occurrence = sample.occurrences.find(occ => occ.cid === occID);
        occurrence.attrs.taxon = taxon;
      } else {
        const [occ] = sample.occurrences;
        occ.attrs.taxon = taxon;
        await occ.save();
      }

      this.context.goBack();
    };

    const favouriteSpecies = getUserFavouriteSpecies();

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
            favouriteSpecies={favouriteSpecies}
            namesFilter={searchNamesOnly}
            informalGroups={selectedFilters}
          />
        </AppMain>
      </IonPage>
    );
  }
}

export default Controller;
