import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Page, Header, Main, useSample } from '@flumens';
import { IonList } from '@ionic/react';
import Sample from 'common/models/sample';
import MenuAttr from 'Survey/common/Components/MenuAttr';
import MenuDynamicAttrs from 'Survey/common/Components/MenuDynamicAttrs';
import MenuLocation from 'Survey/common/Components/MenuLocation';
import MenuTaxonItem from 'Survey/common/Components/MenuTaxonItem';
import PhotoPicker from 'Survey/common/Components/PhotoPicker';
import VerificationMessage from 'Survey/common/Components/VerificationMessage';
import { useSensitivityTip } from 'Survey/common/Components/hooks';

const ListOccurrenceHome = () => {
  const { url } = useRouteMatch();
  const showSensitivityWarning = useSensitivityTip();

  const { subSample } = useSample<Sample>();
  if (!subSample) return null;

  const surveyConfig = subSample.getSurvey();

  const [occ] = subSample.occurrences;
  const { isDisabled } = subSample;

  return (
    <Page id="survey-default-edit">
      <Header title="Edit" />

      <Main className="[--padding-bottom:30px]">
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
            <MenuAttr
              model={occ}
              attr="comment"
              itemProps={{
                routerLink: `${url}/occ/${occ.cid}/comment`,
              }}
            />
            <MenuDynamicAttrs
              model={subSample}
              surveyConfig={surveyConfig}
              skipLocks
            />
            <MenuAttr
              model={occ}
              attr="sensitivityPrecision"
              onChange={showSensitivityWarning}
            />
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(ListOccurrenceHome);
