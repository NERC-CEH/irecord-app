import { FC } from 'react';
import Occurrence from 'models/occurrence';
import VerificationIcon from './VerificationIcon';

interface Props {
  occ: Occurrence;
}

const VerificationStatus: FC<Props> = ({ occ }) => {
  if (!occ?.isUploaded()) return null;

  const status = occ.getVerificationStatus();
  if (!status) return null;

  return <VerificationIcon status={status} />;
};

export default VerificationStatus;
