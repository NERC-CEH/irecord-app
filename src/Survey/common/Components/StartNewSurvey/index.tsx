import { useEffect, useContext } from 'react';
import { useRouteMatch } from 'react-router';
import { useAlert } from '@flumens';
import { NavContext, IonPage } from '@ionic/react';
import samples from 'models/collections/samples';
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

      const sample = await survey.create({ alert });
      await sample.save();

      samples.push(sample);

      context.navigate(`${match.url}/${sample.cid}`, 'none', 'replace');
    };

    createSample();
  };
  useEffect(createSampleWrap, []);

  if (SurveyCreatePage) return <SurveyCreatePage />;

  return <IonPage id="start-new-survey" />;
}

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
