import { FC, useState, useContext } from 'react';
import Sample from 'models/sample';
import {
  IonHeader,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonBadge,
  IonIcon,
  IonList,
  NavContext,
  IonButton,
  IonItemDivider,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Page, Main, date as DateHelp } from '@flumens';
import userModel from 'models/user';
import appModel from 'models/app';
import { Trans as T } from 'react-i18next';
import InfoBackgroundMessage from 'common/Components/InfoBackgroundMessage';
import savedSamples from 'models/savedSamples';
import { addOutline } from 'ionicons/icons';
import VirtualList from './VirtualList';
import Survey from './Survey';
import Map from './Map';
import './styles.scss';

// https://stackoverflow.com/questions/47112393/getting-the-iphone-x-safe-area-using-javascript
const rawSafeAreaTop =
  getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0px';
const SAFE_AREA_TOP = parseInt(rawSafeAreaTop.replace('px', ''), 10);
const LIST_PADDING = 90 + SAFE_AREA_TOP;
const LIST_ITEM_HEIGHT = 75 + 10; // 10px for padding
const LIST_ITEM_DIVIDER_HEIGHT = 38;

function byCreateTime(sample1: Sample, sample2: Sample) {
  const date1 = new Date(sample1.attrs.date);
  const date2 = new Date(sample2.attrs.date);
  return date2.getTime() - date1.getTime();
}

function roundDate(date: number) {
  let roundedDate = date - (date % (24 * 60 * 60 * 1000)); // subtract amount of time since midnight
  roundedDate += new Date().getTimezoneOffset() * 60 * 1000; // add on the timezone offset
  return new Date(roundedDate);
}

const getSurveys = (surveys: Sample[], showUploadAll?: boolean) => {
  const dates: any = [];
  const dateIndices: any = [];

  const groupedSurveys: any = [];
  let counter: any;

  [...surveys].forEach(survey => {
    const date = roundDate(new Date(survey.attrs.date).getTime()).toString();
    if (!dates.includes(date)) {
      dates.push(date);
      dateIndices.push(groupedSurveys.length);
      counter = { date, count: 0 };
      groupedSurveys.push(counter);
    }

    counter.count++;
    groupedSurveys.push(survey);
  });

  // eslint-disable-next-line react/no-unstable-nested-components
  const Item: FC<{ index: number }> = ({ index, ...itemProps }) => {
    if (dateIndices.includes(index)) {
      const { date, count } = groupedSurveys[index];
      return (
        <IonItemDivider key={date} style={(itemProps as any).style} mode="ios">
          <IonLabel>{DateHelp.print(date, true)}</IonLabel>
          {count > 1 && <IonLabel slot="end">{count}</IonLabel>}
        </IonItemDivider>
      );
    }

    const sample = groupedSurveys[index];

    return (
      <Survey
        key={sample.cid}
        sample={sample}
        uploadIsPrimary={!showUploadAll}
        {...itemProps}
      />
    );
  };

  const itemCount = surveys.length + dateIndices.length;

  const getItemSize = (index: number) =>
    dateIndices.includes(index) ? LIST_ITEM_DIVIDER_HEIGHT : LIST_ITEM_HEIGHT;

  return (
    <VirtualList
      itemCount={itemCount}
      itemSize={getItemSize}
      Item={Item}
      topPadding={LIST_PADDING}
      bottomPadding={LIST_ITEM_HEIGHT / 2}
    />
  );
};

const UserSurveyComponent: FC = () => {
  const { navigate } = useContext(NavContext);

  const param: any = useParams();
  const initSegment = param?.id || 'pending';
  const [segment, setSegment] = useState(initSegment);

  const onSegmentClick = (e: any) => setSegment(e.detail.value);

  const getSamplesList = (uploaded?: boolean) => {
    const byUploadStatus = (sample: Sample) =>
      uploaded ? sample.metadata.syncedOn : !sample.metadata.syncedOn;

    return savedSamples.filter(byUploadStatus).sort(byCreateTime);
  };

  const onUploadAll = () => {
    const isLoggedIn = userModel.isLoggedIn();
    if (!isLoggedIn) {
      navigate(`/user/login`);
      return null;
    }

    return savedSamples.uploadAll();
  };

  const getUploadedSurveys = () => {
    const surveys = getSamplesList(true);

    if (!surveys.length) {
      return <InfoBackgroundMessage>No uploaded surveys</InfoBackgroundMessage>;
    }

    return getSurveys(surveys);
  };

  const isFinished = (sample: Sample) => sample.metadata.saved;
  const hasManyPending = () => getSamplesList().filter(isFinished).length > 5;
  const navigateToPrimarySurvey = () => navigate(`/survey/point`);

  const getPendingSurveys = () => {
    const surveys = getSamplesList(false);

    if (!surveys.length) {
      return (
        <InfoBackgroundMessage>
          <div>
            You have no finished surveys.
            <br />
            <br />
            Press
            <IonIcon icon={addOutline} onClick={navigateToPrimarySurvey} /> to
            add.
          </div>
        </InfoBackgroundMessage>
      );
    }

    const showUploadAll = hasManyPending();

    return (
      <>
        {getSurveys(surveys, showUploadAll)}

        {showUploadAll && (
          <IonButton
            expand="block"
            size="small"
            className="upload-all-button"
            onClick={onUploadAll}
          >
            Upload All
          </IonButton>
        )}
      </>
    );
  };

  const getPendingSurveysCount = () => {
    const pendingSurveys = getSamplesList();

    if (!pendingSurveys.length) {
      return null;
    }

    return (
      <IonBadge color="warning" slot="end">
        {pendingSurveys.length}
      </IonBadge>
    );
  };

  const getUploadedSurveysCount = () => {
    const uploadedSurveys = getSamplesList(true);

    if (!uploadedSurveys.length) {
      return null;
    }

    return (
      <IonBadge color="light" slot="end">
        {uploadedSurveys.length}
      </IonBadge>
    );
  };

  const showingPending = segment === 'pending';
  const showingUploaded = segment === 'uploaded';
  const showingMap = segment === 'map';

  const { useExperiments } = appModel.attrs;

  return (
    <Page id="home-user-surveys">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonSegment onIonChange={onSegmentClick} value={segment}>
            <IonSegmentButton value="pending">
              <IonLabel className="ion-text-wrap">
                <T>Pending</T>
                {getPendingSurveysCount()}
              </IonLabel>
            </IonSegmentButton>

            <IonSegmentButton value="uploaded">
              <IonLabel className="ion-text-wrap">
                <T>Uploaded</T>
                {getUploadedSurveysCount()}
              </IonLabel>
            </IonSegmentButton>

            {useExperiments && (
              <IonSegmentButton value="map">
                <IonLabel className="ion-text-wrap">
                  <T>Map</T>
                </IonLabel>
              </IonSegmentButton>
            )}
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <Main>
        {showingPending && <IonList>{getPendingSurveys()}</IonList>}

        {showingUploaded && <IonList>{getUploadedSurveys()}</IonList>}

        {showingMap && <Map />}
      </Main>
    </Page>
  );
};

export default observer(UserSurveyComponent);
