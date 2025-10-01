import { useContext } from 'react';
import { addOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useToast, getRelativeDate, VirtualList, Button } from '@flumens';
import { IonIcon, IonLabel, IonList, NavContext } from '@ionic/react';
import samplesCollection, {
  bySurveyDate,
  uploadAllSamples,
} from 'models/collections/samples';
import Sample from 'models/sample';
import userModel from 'models/user';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import Survey from './Survey';

// https://stackoverflow.com/questions/47112393/getting-the-iphone-x-safe-area-using-javascript
const rawSafeAreaTop =
  getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0px';
const SAFE_AREA_TOP = parseInt(rawSafeAreaTop.replace('px', ''), 10);
const LIST_PADDING = 90 + SAFE_AREA_TOP;
const LIST_ITEM_HEIGHT = 75 + 10; // 10px for padding
const LIST_ITEM_DIVIDER_HEIGHT = 38;

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
    const date = roundDate(new Date(survey.data.date).getTime()).toString();
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
          <IonLabel>
            <T>{getRelativeDate(date)}</T>
          </IonLabel>
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

const PendingSurveys = () => {
  const { navigate } = useContext(NavContext);
  const toast = useToast();

  const notUploaded = (sample: Sample) => !sample.syncedAt;
  const surveys = samplesCollection.filter(notUploaded).sort(bySurveyDate);

  const isFinished = (sample: Sample) => sample.metadata.saved;
  const hasManyPending = () => surveys.filter(isFinished).length > 4;

  const onUploadAll = () => {
    const isLoggedIn = userModel.isLoggedIn();
    if (!isLoggedIn) {
      navigate(`/user/login`);
      return null;
    }

    return uploadAllSamples(toast);
  };

  const navigateToPrimarySurvey = () => navigate(`/survey/default`);

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
          to add one
        </div>
      </InfoBackgroundMessage>
    );
  }

  const showUploadAll = hasManyPending();

  return (
    <IonList>
      {getSurveys(surveys, showUploadAll)}

      {showUploadAll && (
        <Button
          className="absolute bottom-0 right-0 mx-auto my-2.5 px-5 py-2 shadow-xl"
          color="secondary"
          onPress={onUploadAll}
          preventDefault
        >
          Upload All
        </Button>
      )}
    </IonList>
  );
};

export default PendingSurveys;
