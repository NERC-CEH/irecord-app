import { FC } from 'react';
import Occurrence from 'models/occurrence';
import { InfoMessage, InfoButton } from '@flumens';
import { Trans as T } from 'react-i18next';
import clsx from 'clsx';
import { checkmarkCircle, closeCircle } from 'ionicons/icons';
import './styles.scss';

const getVerificationText = (
  status: string,
  message: string,
  taxonName: string
) => {
  const statusMessage = message || status;
  const verifyStatus: { [key: string]: JSX.Element } = {
    verified: (
      <>
        <h2>
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
        <h2>
          <b>
            <T>Verification</T>
          </b>
          : <T>{statusMessage}</T>
        </h2>
        <div>
          <T>
            Thanks for sending in your record. From this record details, we
            think it could be the <b>{{ taxonName }}</b> species.
          </T>
        </div>
      </>
    ),
    rejected: (
      <>
        <h2>
          <b>
            <T>Verification</T>
          </b>
          : <T>{statusMessage}</T>
        </h2>

        <div>
          <T>
            Thanks for sending in your record. We do not think this is{' '}
            <b>{{ taxonName }}</b> species.
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
  verified: checkmarkCircle,
  plausible: checkmarkCircle,
  rejected: closeCircle,
};

const VerificationMessage: FC<Props> = ({ occurrence }) => {
  const status = occurrence.getVerificationStatus();
  const message = occurrence.getVerificationStatusMessage();
  const taxonName = occurrence.getPrettyName();
  const verificationObject = occurrence?.metadata?.verification;

  if (!status) return null;

  const textCode = status;

  const verificationText = getVerificationText(textCode, message, taxonName);

  if (!verificationText) return null;

  const icon: string = icons[status];

  const verifierName = verificationObject?.verifier?.name;
  const verifyDate = verificationObject?.verified_on?.split(' ')[0];

  const hasVerifyDetails = verifierName && verifyDate;

  return (
    <InfoMessage
      className={clsx('verification-message', status)}
      icon={icon}
      skipTranslation
    >
      {verificationText}
      {hasVerifyDetails && (
        <InfoButton label="Details" header="Details">
          <p>
            <T>Verified by:</T>
            <b>{verifierName}</b>
          </p>
          <p>
            <T>Verified on:</T>
            <b>{verifyDate}</b>
          </p>
        </InfoButton>
      )}
    </InfoMessage>
  );
};

export default VerificationMessage;
