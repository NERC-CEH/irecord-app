import { useEffect, useContext } from 'react';
import { useRouteMatch } from 'react-router';
import { useAlert } from '@flumens';
import { NavContext, IonPage } from '@ionic/react';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import savedSamples from 'models/savedSamples';
import { Survey } from 'Survey/common/config';
import './styles.scss';

type Props = {
  survey: Survey;
  SurveyCreatePage?: any;
};

function StartNewSurvey({ survey, SurveyCreatePage }: Props) {
  const context = useContext(NavContext);
  const match = useRouteMatch();
  const alert = useAlert();

  const createSampleWrap = () => {
    const createSample = async () => {
      if (SurveyCreatePage) return;

      const sample = await survey.create({ Sample, Occurrence, alert });
      await sample.save();

      savedSamples.push(sample);

      context.navigate(`${match.url}/${sample.cid}`, 'none', 'replace');
    };

    createSample();
  };
  useEffect(createSampleWrap, []);

  if (SurveyCreatePage) return <SurveyCreatePage />;

  return <IonPage id="start-new-survey" />;
}

// eslint-disable-next-line @getify/proper-arrows/name
StartNewSurvey.with = (survey: Survey, SurveyCreatePage?: any) => {
  const StartNewSurveyWithRouter = (params: any) => (
    <StartNewSurvey
      survey={survey}
      SurveyCreatePage={SurveyCreatePage}
      {...params}
    />
  );
  return StartNewSurveyWithRouter;
};

export default StartNewSurvey;
