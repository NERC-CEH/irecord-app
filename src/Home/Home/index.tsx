import { useState, useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { addOutline, cameraOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
import {
  Page,
  Main,
  useToast,
  getRelativeDate,
  Badge,
  VirtualList,
} from '@flumens';
import {
  IonHeader,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonList,
  NavContext,
  IonButton,
} from '@ionic/react';
import InfoBackgroundMessage from 'common/Components/InfoBackgroundMessage';
import samples, { uploadAllSamples } from 'models/collections/samples';
import Sample from 'models/sample';
import userModel from 'models/user';
import Survey from './Survey';
import './styles.scss';

// https://stackoverflow.com/questions/47112393/getting-the-iphone-x-safe-area-using-javascript
const rawSafeAreaTop =
  getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0px';
const SAFE_AREA_TOP = parseInt(rawSafeAreaTop.replace('px', ''), 10);
const LIST_PADDING = 90 + SAFE_AREA_TOP;
const LIST_ITEM_HEIGHT = 75 + 10; // 10px for padding
const LIST_ITEM_DIVIDER_HEIGHT = 38;

function bySurveyDate(sample1: Sample, sample2: Sample) {
  const date1 = new Date(sample1.attrs.date);
  const moveToTop = !date1 || date1.toString() === 'Invalid Date';
  if (moveToTop) return -1;

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
  let counter: any = {};

  [...surveys].forEach(survey => {
    const date = roundDate(new Date(survey.attrs.date).getTime()).toString();
    if (!dates.includes(date) && date !== 'Invalid Date') {
      dates.push(date);
      dateIndices.push(groupedSurveys.length);
      counter = { date, count: 0 };
      groupedSurveys.push(counter);
    }

    counter.count += 1;
    groupedSurveys.push(survey);
  });

  // eslint-disable-next-line react/no-unstable-nested-components
  const Item = ({ index, ...itemProps }: { index: number }) => {
    if (dateIndices.includes(index)) {
      const { date, count } = groupedSurveys[index];
      return (
        <div
          className="list-divider rounded-md"
          key={date}
          style={(itemProps as any).style}
        >
          <IonLabel>{getRelativeDate(date)}</IonLabel>
          {count > 1 && <IonLabel slot="end">{count}</IonLabel>}
        </div>
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

const UserSurveyComponent = () => {
  const { navigate } = useContext(NavContext);

  const toast = useToast();

  const match = useRouteMatch<{ id?: string }>();

  const initSegment = 'pending';
  const [segment, setSegment] = useState(initSegment);

  useEffect(() => {
    match.params?.id && setSegment(match.params?.id);
  }, [match.params?.id]);

  const onSegmentClick = (e: any) => {
    const newSegment = e.detail.value;
    setSegment(newSegment);

    const basePath = match.path.split('/:id?')[0];
    const path = `${basePath}/${newSegment}`;
    window.history.replaceState(null, '', path); // https://stackoverflow.com/questions/57101831/react-router-how-do-i-update-the-url-without-causing-a-navigation-reload
  };

  const getSamplesList = (uploaded?: boolean) => {
    const byUploadStatus = (sample: Sample) =>
      uploaded ? sample.syncedAt : !sample.syncedAt;

    return samples.filter(byUploadStatus).sort(bySurveyDate);
  };

  const onUploadAll = () => {
    const isLoggedIn = userModel.isLoggedIn();
    if (!isLoggedIn) {
      navigate(`/user/login`);
      return null;
    }

    return uploadAllSamples(toast);
  };

  const getUploadedSurveys = () => {
    const surveys = getSamplesList(true);

    if (!surveys.length) {
      return (
        <InfoBackgroundMessage className="mt-20">
          No uploaded surveys
        </InfoBackgroundMessage>
      );
    }

    return getSurveys(surveys);
  };

  const isFinished = (sample: Sample) => sample.metadata.saved;
  const hasManyPending = () => getSamplesList().filter(isFinished).length > 5;
  const navigateToPrimarySurvey = () => navigate(`/survey/default`);

  const getPendingSurveys = () => {
    const surveys = getSamplesList(false);

    if (!surveys.length) {
      return (
        <InfoBackgroundMessage className="mt-20">
          <div onClick={navigateToPrimarySurvey}>
            You have no finished surveys.
            <br />
            <br />
            Press{' '}
            <IonIcon
              icon={addOutline}
              className="rounded-full bg-primary-600 text-white"
            />{' '}
            to add record details, or press <IonIcon icon={cameraOutline} /> to
            add a photo first.
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
    if (!pendingSurveys.length) return null;

    return (
      <Badge
        color="warning"
        skipTranslation
        size="small"
        fill="solid"
        className="mx-1 bg-warning-600"
      >
        {pendingSurveys.length}
      </Badge>
    );
  };

  const showingPending = segment === 'pending';
  const showingUploaded = segment === 'uploaded';

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
              </IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <Main>
        {showingPending && <IonList>{getPendingSurveys()}</IonList>}
        {showingUploaded && <IonList>{getUploadedSurveys()}</IonList>}
      </Main>
    </Page>
  );
};

export default observer(UserSurveyComponent);
