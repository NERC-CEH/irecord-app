import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Page, Header, Main, useSample } from '@flumens';
import { IonList } from '@ionic/react';
import Sample from 'common/models/sample';
import MenuAttr from 'Survey/common/Components/MenuAttr';
import MenuDynamicAttr from 'Survey/common/Components/MenuDynamicAttr';
import MenuLocation from 'Survey/common/Components/MenuLocation';
import MenuTaxonItem from 'Survey/common/Components/MenuTaxonItem';
import PhotoPicker from 'Survey/common/Components/PhotoPicker';
import VerificationMessage from 'Survey/common/Components/VerificationMessage';
import useSensitivityTip from 'Survey/common/Components/hooks';
import { commentAttr, defaultSensitivityPrecisionAttr } from './config';

const ListOccurrenceHome = () => {
  const { url } = useRouteMatch();
  const showSensitivityWarning = useSensitivityTip();

  const { sample, subSample } = useSample<Sample, Sample>();
  if (!subSample || !sample) return null;

  const survey = sample.getSurvey();
  const subSampleSurvey = subSample.getSurvey();
  console.log(subSampleSurvey);
  const [occ] = subSample.occurrences;
  const { isDisabled } = subSample;

  return (
    <Page id="survey-default-edit">
      <Header title="Edit" />

      <Main className="pb-ion-s-10">
        <IonList lines="full" className="mb-2 flex! flex-col gap-4">
          {isDisabled && (
            <div className="rounded-list">
              <VerificationMessage occurrence={occ} />
            </div>
          )}

          <div className="rounded-list">
            <PhotoPicker model={occ} />
          </div>
          <div className="rounded-list">
            <MenuTaxonItem occ={occ} />
            <MenuLocation sample={subSample} skipName isRequired={false} />

            {subSampleSurvey.render?.map((attr: any) => (
              <MenuDynamicAttr
                key={attr.id}
                model={subSample}
                block={attr}
                survey={survey.name}
                taxa={subSampleSurvey.taxa}
              />
            ))}
            {subSampleSurvey.occ?.render?.map((attr: any) => (
              <MenuDynamicAttr
                key={attr.id}
                model={occ}
                block={attr}
                useSeparateOccPage
                survey={survey.name}
                taxa={subSampleSurvey.taxa}
              />
            ))}
            <MenuAttr.WithLock
              model={occ}
              block={defaultSensitivityPrecisionAttr}
              onChange={(val, _, { record }) => {
                record[defaultSensitivityPrecisionAttr.id] = val; // eslint-disable-line no-param-reassign
                showSensitivityWarning(val);
              }}
              survey={survey.name}
              taxa="all"
            />
            <MenuAttr.WithLock
              model={occ}
              block={commentAttr}
              link={`${url}/occ/${occ.cid}/comment`}
              survey={survey.name}
              taxa="all"
            />
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(ListOccurrenceHome);
