import type { ReactNode } from 'react';
import { IonBackdrop } from '@ionic/react';
import './styles.scss';

type Props = {
  children: ReactNode;
};

const CustomAlert = ({ children }: Props) => (
  <div className="custom-alert">
    <IonBackdrop tappable visible stopPropagation />
    <div className="message">{children}</div>
  </div>
);

export default CustomAlert;
