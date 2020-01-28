import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IonPage, IonList } from '@ionic/react';
import AppHeader from 'Components/Header';
import Footer from 'Components/PhotoPickerFooter';
import DynamicMenuAttrs from 'Components/DynamicMenuAttrs';
import AppMain from 'Components/Main';

export default class index extends Component {
  static propTypes = {
    appModel: PropTypes.object.isRequired,
    savedSamples: PropTypes.array.isRequired,
    match: PropTypes.object,
  };

  constructor(props) {
    super(props);

    const { id, occId } = this.props.match.params;
    this.surveySample = this.props.savedSamples.find(({ cid }) => cid === id);
    const occ = this.surveySample.occurrences.find(({ cid }) => cid === occId);
    this.state = {
      occ,
    };
  }

  render() {
    const {
      appModel,
      match: { url },
    } = this.props;
    const { occ } = this.state;

    return (
      <IonPage id="survey-default-edit">
        <AppHeader title={t('Edit')} _defaultToEdit={url} />
        <AppMain>
          <IonList lines="full" class="core inputs">
            <DynamicMenuAttrs
              appModel={appModel}
              model={occ}
              useLocks
              noWrapper
              url={url}
            />
          </IonList>
        </AppMain>
        <Footer model={occ} />
      </IonPage>
    );
  }
}
