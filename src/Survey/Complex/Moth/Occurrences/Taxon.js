import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import AppHeader from 'Components/Header';
import TaxonSearch, { TaxonSearchFilters } from 'Components/TaxonSearch';
import mothSurvey from 'common/config/surveys/complex/moth';
import Occurrence from 'occurrence';
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

    const { id, occId } = this.props.match.params;
    this.surveySample = this.props.savedSamples.find(({ cid }) => cid === id);
    const occurrence = this.surveySample.occurrences.find(
      ({ cid }) => cid === occId
    );
    this.state = {
      occurrence,
    };
  }

  getNewOccurrence = async taxon => {
    const newOccurrene = await mothSurvey.occ.create(Occurrence, taxon);

    this.surveySample.occurrences.push(newOccurrene);
    await this.surveySample.save();

    return newOccurrene;
  };

  render() {
    const { history, match, appModel } = this.props;
    const { occurrence } = this.state;

    const isNew = !occurrence;

    const onSpeciesSelected = async (taxon, editBtnClicked) => {
      if (isNew) {
        const newOccurrence = await this.getNewOccurrence(taxon);
        if (editBtnClicked) {
          const url = match.url.replace('/new', '');
          history.replace(`${url}/${newOccurrence.cid}`);
          return;
        }

        let name = taxon.scientific_name;
        if (taxon.found_in_name >= 0) {
          name = taxon.common_names[taxon.found_in_name];
        }

        success(`${t('Added')} ${name}`, 500);
        return;
      }

      this.state.occurrence.attrs.taxon = taxon;
      await this.state.occurrence.save();

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
