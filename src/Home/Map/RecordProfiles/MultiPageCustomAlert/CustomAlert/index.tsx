import { IonBackdrop } from '@ionic/react';
import './styles.scss';

type Props = {
  children: any;
};

const CustomAlert = ({ children }: Props) => (
  <div className="custom-alert">
    <IonBackdrop tappable visible stopPropagation />
    <div className="message">{children}</div>
  </div>
);

export default CustomAlert;
