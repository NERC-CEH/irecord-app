import Occurrence from 'models/occurrence';
import Icon from './Icon';

interface Props {
  occ: Occurrence;
}

const VerificationStatus = ({ occ }: Props) => {
  if (!occ?.isUploaded) return null;

  const status = occ.getVerificationStatus();
  if (!status) return null;

  return <Icon status={status} />;
};

export default VerificationStatus;
