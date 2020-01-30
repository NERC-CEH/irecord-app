import React from 'react';
import {
  IonList,
  IonItem,
  IonSegment,
  IonLabel,
  IonSegmentButton,
  IonBadge,
  IonPage,
  IonHeader,
} from '@ionic/react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import AppMain from 'Components/Main';
import VirtualList from './components/VirtualList';
import UserFeedbackRequest from './components/UserFeedbackRequest';
import './styles.scss';
import './empty-samples-list-icon.svg';

function byDate(smp1, smp2) {
  const date1 = new Date(smp1.attrs.date);
  const date2 = new Date(smp2.attrs.date);
  return date2.getTime() - date1.getTime();
}

@observer
class Component extends React.Component {
  static propTypes = {
    savedSamples: PropTypes.array.isRequired,
    appModel: PropTypes.object.isRequired,
  };

  state = {
    segment: 'pending',
    listHeight: 714,
  };

  constructor(props) {
    super(props);

    this.mainRef = React.createRef();
  }

  async componentDidMount() {
    const mainView = this.mainRef.current || {};
    if (mainView.getScrollElement) {
      const el = await mainView.getScrollElement();
      this.setState({ listHeight: el.offsetHeight });
    }
  }

  onSegmentClick = e => {
    this.setState({ segment: e.detail.value });
  };

  getSamplesList(uploaded) {
    const { savedSamples } = this.props;

    return savedSamples
      .filter(sample =>
        uploaded ? sample.metadata.synced_on : !sample.metadata.synced_on
      )
      .sort(byDate);
  }

  getList = (pendingSurveys, uploadedSurveys) => {
    const showingPending = this.state.segment === 'pending';

    const filteredSurveys = showingPending ? pendingSurveys : uploadedSurveys;

    if (!filteredSurveys.length) {
      const message = showingPending
        ? 'No finished pending records'
        : 'No uploaded surveys';

      return (
        <IonList lines="full">
          <IonItem className="empty">
            <span>{t(message)}</span>
          </IonItem>
        </IonList>
      );
    }

    return (
      <>
        <UserFeedbackRequest
          samplesLength={filteredSurveys.length}
          appModel={this.props.appModel}
        />
        <VirtualList
          surveys={filteredSurveys}
          listHeight={this.state.listHeight}
        />
      </>
    );
  };

  render() {
    const { segment } = this.state;
    const showingPending = segment === 'pending';

    const pendingSurveys = this.getSamplesList();
    const uploadedSurveys = this.getSamplesList(true);

    return (
      <IonPage id="surveys-list">
        <IonHeader mode="ios">
          <IonSegment onIonChange={this.onSegmentClick} value={segment}>
            <IonSegmentButton value="pending" checked={showingPending}>
              <IonLabel>
                {t('Pending')}
                {pendingSurveys.length ? (
                  <IonBadge color="danger" slot="end">
                    {pendingSurveys.length}
                  </IonBadge>
                ) : null}
              </IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="uploaded" checked={!showingPending}>
              <IonLabel>
                {t('Uploaded')}
                {uploadedSurveys.length ? (
                  <IonBadge color="light" slot="end">
                    {uploadedSurveys.length}
                  </IonBadge>
                ) : null}
              </IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonHeader>
        <AppMain
          class="ion-padding"
          ref={this.mainRef}
          style={{ overflow: 'hidden' }}
          slot="fixed"
        >
          {this.getList(pendingSurveys, uploadedSurveys)}
        </AppMain>
      </IonPage>
    );
  }
}

export default Component;
