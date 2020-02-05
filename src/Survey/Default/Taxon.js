import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import AppHeader from 'Components/Header';
import TaxonSearch, { TaxonSearchFilters } from 'Components/TaxonSearch';
import Sample from 'sample';
import Occurrence from 'occurrence';
import surveyConfig from 'common/config/surveys/default';
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
    const sample = await surveyConfig.create(Sample, Occurrence, null, taxon);
    sample.save();
    savedSamples.push(sample);
    return sample;
  }

  onSpeciesSelected = async (taxon, editBtnClicked) => {
    const { match, history } = this.props;
    const { sample } = this.state;
    const isNew = !sample;

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

    const [occ] = sample.occurrences;
    sample.removeOldTaxonAttributes(occ, taxon);

    occ.attrs.taxon = taxon;
    await occ.save();

    this.context.goBack();
  };

  getUserFavouriteSpecies = () => {
    const { userModel } = this.props;

    const { statistics } = userModel.attrs;
    if (!statistics || !statistics.species || !statistics.species.length) {
      return null;
    }
    return [...statistics.species];
  };

  render() {
    const { appModel } = this.props;
    const { sample } = this.state;

    const isNew = !sample;

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
            favouriteSpecies={this.getUserFavouriteSpecies()}
            namesFilter={searchNamesOnly}
            informalGroups={selectedFilters}
          />
        </AppMain>
      </IonPage>
    );
  }
}

export default Controller;
