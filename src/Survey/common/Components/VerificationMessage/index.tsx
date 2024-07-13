import { FC } from 'react';
import clsx from 'clsx';
import { checkmarkCircle, closeCircle } from 'ionicons/icons';
import { useTranslation, Trans as T } from 'react-i18next';
import { InfoMessage, InfoButton } from '@flumens';
import Occurrence from 'models/occurrence';
import './styles.scss';

const getVerificationText = (
  status: string,
  message: string,
  taxonName: string,
  t: any
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
            think it could be the <b>{{ taxonName } as any}</b> species.
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
            Thanks for sending in your record. A verifier has marked it as{' '}
            <b>{{ statusMessage: t(statusMessage) } as any}</b> in this case.
            Please log in to the ORKS website to see any additional information
            that the verifier may have provided.
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
  const { t } = useTranslation();

  const verificationObject = occurrence?.metadata?.verification;

  if (!status) return null;

  const textCode = status;

  const verificationText = getVerificationText(textCode, message, taxonName, t);

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
