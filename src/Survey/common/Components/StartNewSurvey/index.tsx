import { useEffect, useContext, useState } from 'react';
import { NavContext, IonPage } from '@ionic/react';
import appModel from 'models/app';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
import savedSamples from 'models/savedSamples';
import { Survey } from 'Survey/common/config';
import { useRouteMatch } from 'react-router';
import './styles.scss';

async function getNewSample(survey: Survey) {
  const sample = await survey.create(Sample, Occurrence, {});
  await sample.save();

  savedSamples.push(sample);
  await appModel.save();

  return sample;
}

type Props = {
  survey: Survey;
  SurveyCreatePage?: any;
};

function StartNewSurvey({ survey, SurveyCreatePage }: Props) {
  const context = useContext(NavContext);
  const [showSurveyCreatePage, setShowSurveyCreatePage] = useState(false);
  const match = useRouteMatch();

  const createSampleWrap = () => {
    const createSample = async () => {
      if (SurveyCreatePage) {
        setShowSurveyCreatePage(true);
        return;
      }

      const sample = await getNewSample(survey);

      context.navigate(`${match.url}/${sample.cid}`, 'none', 'replace');
    };

    createSample();
  };
  useEffect(createSampleWrap, []);

  if (showSurveyCreatePage) {
    return <SurveyCreatePage />;
  }

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
