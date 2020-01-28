import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IonPage, IonList } from '@ionic/react';
import AppHeader from 'Components/Header';
import Footer from 'Components/PhotoPickerFooter';
import AppMain from 'Components/Main';
import DynamicMenuAttrs from 'Components/DynamicMenuAttrs';

export default class index extends Component {
  static propTypes = {
    appModel: PropTypes.object.isRequired,
    savedSamples: PropTypes.array.isRequired,
    match: PropTypes.object,
  };

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

  onAttrToggle = (attr, checked) => {
    const sample = this.state.subSample;

    const [occ] = sample.occurrences;

    const attrParts = attr.split(':');
    const attrType = attrParts[0];
    const attrName = attrParts[1];

    const model = attrType === 'smp' ? sample : occ;

    model.attrs[attrName] = checked;

    return sample.save();
  };

  render() {
    const {
      appModel,
      match: { url },
    } = this.props;
    const sample = this.state.subSample;

    const surveyConfig = { ...sample.getSurvey() };
    surveyConfig.editForm = ['occ:taxon', 'smp:location', 'occ:comment'];

    return (
      <IonPage id="survey-default-edit">
        <AppHeader title={t('Edit')} _defaultToEdit={url} />

        <AppMain>
          <IonList lines="full" class="core inputs">
            <DynamicMenuAttrs
              appModel={appModel}
              model={sample}
              surveyConfig={surveyConfig}
              noWrapper
              url={url}
            />
          </IonList>

          <DynamicMenuAttrs
            appModel={appModel}
            model={sample}
            onAttrToggle={this.onAttrToggle}
            useLocks
            url={url}
          />
        </AppMain>
        <Footer model={sample.occurrences[0]} />
      </IonPage>
    );
  }
}
