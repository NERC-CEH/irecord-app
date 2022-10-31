import { FC } from 'react';
import { IonBackdrop } from '@ionic/react';
import './styles.scss';

const CustomAlert: FC = ({ children }) => (
  <div className="custom-alert">
    <IonBackdrop tappable visible stopPropagation />
    <div className="message">{children}</div>
  </div>
);

export default CustomAlert;
