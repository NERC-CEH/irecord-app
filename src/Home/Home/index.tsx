import { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
import { Page, Main, Badge } from '@flumens';
import {
  IonHeader,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
} from '@ionic/react';
import { getPending } from 'common/models/collections/samples';
import PendingSurveys from './Pending';
import UploadedSurveys from './Uploaded';
import './styles.scss';

const UserSurveyComponent = () => {
  const [segment, setSegment] = useState('pending');
  const match = useRouteMatch<{ id?: string }>();

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

  const showingPending = segment === 'pending';
  const showingUploaded = segment === 'uploaded';

  const getPendingSurveysCount = () => {
    const pendingSurveysCount = getPending().length;
    if (!pendingSurveysCount) return null;

    return (
      <Badge
        color="warning"
        skipTranslation
        size="small"
        fill="solid"
        className="mx-1 bg-warning-600"
      >
        {pendingSurveysCount}
      </Badge>
    );
  };

  return (
    <Page id="home-user-surveys">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonSegment onIonChange={onSegmentClick} value={segment}>
            <IonSegmentButton value="pending">
              <div className="w-full flex-col py-1">
                <div className="line-clamp-2 text-wrap">
                  <T>Pending</T>
                </div>
                {getPendingSurveysCount()}
              </div>
            </IonSegmentButton>

            <IonSegmentButton value="uploaded">
              <div className="line-clamp-2 w-full text-wrap py-1">
                <T>Uploaded</T>
              </div>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <Main
        className="[--padding-bottom:0] [--padding-top:0]"
        forceOverscroll={false}
        scrollY={false}
      >
        {showingPending && <PendingSurveys />}

        <UploadedSurveys isOpen={showingUploaded} />
      </Main>
    </Page>
  );
};

export default observer(UserSurveyComponent);
