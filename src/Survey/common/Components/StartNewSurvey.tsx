import { useEffect, useContext, useState } from 'react';
import { NavContext } from '@ionic/react';
import { useAlert } from '@flumens';
import appModel, { SurveyDraftKeys } from 'models/app';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
import savedSamples from 'models/savedSamples';
import { Survey } from 'Survey/common/config';

async function getDraft(draftIdKey: keyof SurveyDraftKeys) {
  const draftID = appModel.attrs[draftIdKey];
  if (draftID) {
    const draftById = ({ cid }: Sample) => cid === draftID;
    const draftSample = savedSamples.find(draftById);
    if (draftSample && !draftSample.isDisabled()) return draftSample;
  }

  return null;
}

async function getNewSample(survey: Survey, draftIdKey: keyof SurveyDraftKeys) {
  const sample = await survey.create(Sample, Occurrence, {});
  await sample.save();

  savedSamples.push(sample);
  appModel.attrs[draftIdKey] = sample.cid;
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
  const alert = useAlert();

  const draftIdKey = `draftId:${survey.name}` as keyof SurveyDraftKeys;

  const pickDraftOrCreateSampleWrap = () => {
    const pickDraftOrCreateSample = async () => {
      let sample = await getDraft(draftIdKey);

      if (!sample) {
        if (SurveyCreatePage) {
          console.log('no sample', draftIdKey);
          setShowSurveyCreatePage(true);

          return;
        }
      }

      await alert({
        header: 'Unfinished record',
        message:
          'You have an incomplete record that needs to be saved before starting another one. Would you like to continue it?',

        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              context.navigate(
                `/survey/default/${sample.cid}`,
                'none',
                'replace'
              );
            },
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: async () => {
              sample.destroy();
              sample = await getNewSample(survey, draftIdKey);
              context.navigate(
                `/survey/default/${sample.cid}`,
                'none',
                'replace'
              );
            },
          },
        ],
      });
    };

    pickDraftOrCreateSample();
  };
  useEffect(pickDraftOrCreateSampleWrap, []);

  if (showSurveyCreatePage) {
    return <SurveyCreatePage />;
  }
  return null;
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
