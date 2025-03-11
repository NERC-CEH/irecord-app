import clsx from 'clsx';
import { checkmarkCircle, closeCircle, helpOutline } from 'ionicons/icons';
import { useTranslation, Trans as T } from 'react-i18next';
import { InfoMessage, InfoButton } from '@flumens';
import { IonIcon } from '@ionic/react';
import Occurrence from 'models/occurrence';
import './styles.scss';

const getVerificationText = (
  status: string,
  message: string,
  taxonName: string,
  t: any
) => {
  const statusMessage = message || status;
  const verifyStatus: { [key: string]: any } = {
    queried: (
      <>
        <h2 className="mb-5">
          <b>
            <T>Verification</T>
          </b>
          : <T>This record has been queried.</T>
        </h2>

        <div>
          <T>
            You can find the verifier query and comments on the iRecord website.
          </T>
        </div>
      </>
    ),
    verified: (
      <>
        <h2 className="mb-5">
          <b>
            <T>Verification</T>
          </b>
          : <T>{statusMessage}</T>
        </h2>

        <div>
          <T>Thanks for sending in your record.</T>
        </div>
      </>
    ),
    plausible: (
      <>
        <h2 className="mb-5">
          <b>
            <T>Verification</T>
          </b>
          : <T>{statusMessage}</T>
        </h2>
        <div>
          <T>
            Thanks for sending in your record. From this record details, we
            think it could be the <b>{{ taxonName } as any}</b> species.
          </T>
        </div>
      </>
    ),
    rejected: (
      <>
        <h2 className="mb-5">
          <b>
            <T>Verification</T>
          </b>
          : <T>{statusMessage}</T>
        </h2>

        <div>
          <T>
            Thanks for sending in your record. A verifier has marked it as{' '}
            <b>"{{ statusMessage: t(statusMessage) } as any}"</b> in this case.
          </T>
        </div>
        <div className="mt-5">
          <T>
            Please log in to the iRecord website to see any additional
            information that the verifier may have provided.
          </T>
        </div>
      </>
    ),
  };

  return verifyStatus[status];
};

type Props = {
  occurrence: Occurrence;
};

const icons: { [key: string]: string } = {
  queried: helpOutline,
  verified: checkmarkCircle,
  plausible: checkmarkCircle,
  rejected: closeCircle,
};

const VerificationMessage = ({ occurrence }: Props) => {
  const { t } = useTranslation();

  const status = occurrence.getVerificationStatus();
  if (!status) return null;

  const message = occurrence.getVerificationStatusMessage();
  const taxonName = occurrence.getPrettyName();

  const verificationObject = occurrence?.metadata?.verification;

  const textCode = status;

  const verificationText = getVerificationText(textCode, message, taxonName, t);
  if (!verificationText) return null;

  const icon: string = icons[status];

  const verifierName = verificationObject?.verifier?.name;
  const verifyDate = verificationObject?.verified_on?.split(' ')[0];

  const hasVerifyDetails = verifierName && verifyDate;

  const colors = {
    verified: 'success',
    plausible: 'warning',
    rejected: 'danger',
    queried: '',
  };
  const color: any = colors[status];

  return (
    <InfoMessage
      className={clsx('verification-message', color)}
      prefix={<IonIcon src={icon} className="size-6" />}
      skipTranslation
      color={color}
    >
      {verificationText}
      {hasVerifyDetails && (
        <InfoButton label="Details" header="Details">
          <p>
            <b>
              <T>Verified by:</T>
            </b>{' '}
            <span>{verifierName}</span>
          </p>
          <p>
            <b>
              <T>Verified on:</T>
            </b>{' '}
            <span>{verifyDate}</span>
          </p>
        </InfoButton>
      )}
    </InfoMessage>
  );
};

export default VerificationMessage;
