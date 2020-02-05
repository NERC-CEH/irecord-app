import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import AppHeader from 'Components/Header';
import TaxonSearch from 'Components/TaxonSearch';
import LocHelp from 'helpers/location';
import AppMain from 'Components/Main';
import { IonPage, NavContext } from '@ionic/react';
import { success } from 'helpers/toast';
import plantSurvey from 'common/config/surveys/complex/plant';
import Sample from 'sample';
import Occurrence from 'occurrence';

function isSurveyLocationSet(surveySample) {
  const { location } = surveySample.attrs;
  const accurateEnough = LocHelp.checkGridType(
    location,
    surveySample.metadata.gridSquareUnit
  );
  return accurateEnough && location.name;
}

/**
 * Configures survey subsample with default attrs and sets it
 * to the parent survey sample.
 * @param surveySample
 * @param sample
 * @param taxon
 * @returns {*}
 */
function configNewSample(surveySample, subSample) {
  // set sample location to survey's location which
  // can be corrected by GPS or user later on
  // TODO: listen for surveySample attribute changes
  if (isSurveyLocationSet(surveySample)) {
    const surveyLocation = JSON.parse(
      JSON.stringify(surveySample.attrs.location)
    );
    delete surveyLocation.name;

    subSample.attrs.location = surveyLocation;

    subSample.startGPS();
  }

  surveySample.samples.push(subSample);
}

@observer
class Controller extends React.Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
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

  getNewSample = async (taxon, editButtonClicked) => {
    const newSubSample = await plantSurvey.smp.create(
      Sample,
      Occurrence,
      taxon
    );

    configNewSample(this.surveySample, newSubSample);
    await this.surveySample.save();

    if (editButtonClicked) {
      return newSubSample;
    }

    return newSubSample;
  };

  render() {
    const { match, history } = this.props;
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

    const informalGroups = this.surveySample.getSurvey().taxonGroups;

    return (
      <IonPage>
        <AppHeader title={t('Species')} />
        <AppMain>
          <TaxonSearch
            onSpeciesSelected={onSpeciesSelected}
            showEditButton={isNew}
            informalGroups={informalGroups}
            resetOnSelect
          />
        </AppMain>
      </IonPage>
    );
  }
}

export default Controller;
