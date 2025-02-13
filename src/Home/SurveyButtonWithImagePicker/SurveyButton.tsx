import { useState } from 'react';
import clsx from 'clsx';
import {
  addOutline,
  cameraOutline,
  closeOutline,
  ellipsisHorizontalOutline,
  imagesOutline,
} from 'ionicons/icons';
import { Trans as T, useTranslation } from 'react-i18next';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { IonActionSheet, IonIcon, isPlatform } from '@ionic/react';
import InfoBackgroundMessage from 'common/Components/InfoBackgroundMessage';

const vibrate = () =>
  isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });

type Props = {
  onPrimarySurvey: any;
  onListSurvey: any;
  onPlantSurvey: any;
  onMothSurvey: any;
  onCameraSurveyStart: any;
  onGallerySurveyStart: any;
};

const SurveyButton = ({
  onPrimarySurvey,
  onListSurvey,
  onPlantSurvey,
  onMothSurvey,
  onCameraSurveyStart,
  onGallerySurveyStart,
}: Props) => {
  const { t } = useTranslation();
  const [showOptions, setShowOptions] = useState(false);
  const [showOtherSurveys, setShowOtherSurveys] = useState(false);
  const toggleOptions = () => {
    !showOptions && vibrate();
    setShowOptions(!showOptions);
  };

  const onPrimarySurveyWrap = () => {
    setShowOptions(false);
    onPrimarySurvey();
  };
  const onCameraSurvey = () => {
    setShowOptions(false);
    onCameraSurveyStart();
  };
  const onGallerySurvey = () => {
    setShowOptions(false);
    onGallerySurveyStart();
  };
  const onShowOtherSurveys = () => {
    setShowOptions(false);
    setShowOtherSurveys(true);
  };
  const onPlantSurveyWrap = () => {
    setShowOptions(false);
    setShowOtherSurveys(false);
    onPlantSurvey();
  };
  const onMothSurveyWrap = () => {
    setShowOptions(false);
    setShowOtherSurveys(false);
    onMothSurvey();
  };
  const onListSurveyWrap = () => {
    setShowOptions(false);
    setShowOtherSurveys(false);
    onListSurvey();
  };

  const infoMessage = (
    <InfoBackgroundMessage
      className="fixed bottom-[20%] left-1/2 z-10 max-w-80 -translate-x-1/2 items-start gap-0 py-8 pr-2 pt-2"
      name="showSurveyOptionsTip"
      skipTranslation
    >
      <div className="flex flex-col gap-6 pt-8 text-left">
        <div className="flex items-center gap-4" onClick={onPrimarySurveyWrap}>
          <IonIcon
            src={addOutline}
            className="size-5 shrink-0 rounded-full bg-primary-800 p-2 text-white shadow-md ring-[0.5px] ring-primary-800"
          />
          <T>Add a record without a photo</T>
        </div>

        <div className="flex items-center gap-4" onClick={onCameraSurvey}>
          <IonIcon
            src={cameraOutline}
            className="size-5 shrink-0 rounded-full bg-primary-800 p-2 text-white shadow-md ring-[0.5px] ring-primary-800"
          />
          <T>Take a new photo of the species</T>
        </div>

        <div className="flex items-center gap-4" onClick={onGallerySurvey}>
          <IonIcon
            src={imagesOutline}
            className="size-5 shrink-0 rounded-full bg-primary-800 p-2 text-white shadow-md ring-[0.5px] ring-primary-800"
          />
          <T>Select multiple photos from your gallery</T>
        </div>

        <div className="flex items-center gap-4" onClick={onShowOtherSurveys}>
          <IonIcon
            src={ellipsisHorizontalOutline}
            className="size-5 shrink-0 rounded-full bg-primary-800 p-2 text-white shadow-md ring-[0.5px] ring-primary-800 [--ionicon-stroke-width:24px]"
          />
          <T>Show other surveys</T>
        </div>
      </div>
    </InfoBackgroundMessage>
  );

  return (
    <>
      <button
        onClick={toggleOptions}
        className={clsx(
          showOptions && 'survey-button-activated',
          'fixed bottom-5 left-1/2 z-50 -translate-x-1/2 pb-[var(--ion-safe-area-bottom,0)]',
          '-mb-4 flex size-16 flex-col items-center justify-center rounded-full bg-primary p-1 text-white',
          showOptions && 'shadow-md'
        )}
      >
        <IonIcon
          src={showOptions ? closeOutline : addOutline}
          className={clsx(
            'size-12',
            !showOptions && '[--ionicon-stroke-width:10px]'
          )}
        />
      </button>

      <IonActionSheet
        isOpen={showOtherSurveys}
        header={t('Other recording options')}
        buttons={[
          { text: t('Plant Survey'), handler: onPlantSurveyWrap },
          { text: t('Moth Survey'), handler: onMothSurveyWrap },
          { text: t('Species List Survey'), handler: onListSurveyWrap },
          { text: t('Cancel'), role: 'cancel' },
        ]}
        onDidDismiss={() => setShowOtherSurveys(false)}
      />

      {showOptions && (
        <>
          <div className="fixed bottom-3 left-1/2 z-50 w-[200px] -translate-x-1/2 pb-[var(--ion-safe-area-bottom,0)]">
            <button
              className="absolute -left-2 bottom-0 flex size-14 items-center justify-center rounded-full bg-primary-800 p-2 text-white shadow-md ring-[0.5px] ring-primary-800"
              onClick={onPrimarySurveyWrap}
            >
              <IonIcon src={addOutline} className="size-full" />
            </button>

            <button
              className="absolute bottom-16 left-1/3 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-primary-800 p-3 text-white shadow-md ring-[0.5px] ring-primary-800"
              onClick={onCameraSurvey}
            >
              <IonIcon src={cameraOutline} className="size-full" />
            </button>

            <button
              className="absolute bottom-16 left-2/3 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-primary-800 p-3 text-white shadow-md ring-[0.5px] ring-primary-800"
              onClick={onGallerySurvey}
            >
              <IonIcon src={imagesOutline} className="size-full" />
            </button>

            <button
              className="absolute -right-2 bottom-0 flex size-14 items-center justify-center rounded-full bg-primary-800 p-2 text-white shadow-md ring-[0.5px] ring-primary-800"
              onClick={onShowOtherSurveys}
            >
              <IonIcon src={ellipsisHorizontalOutline} className="size-full" />
            </button>
          </div>

          {infoMessage}

          <div
            className="fixed inset-0 bg-black/30 transition-opacity"
            aria-hidden="true"
            onClick={() => setShowOptions(false)}
          />
        </>
      )}
    </>
  );
};

export default SurveyButton;
