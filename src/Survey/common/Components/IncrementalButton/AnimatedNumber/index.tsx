import { FC, useState, useEffect, useRef } from 'react';
import { CreateAnimation } from '@ionic/react';
import './styles.scss';

type Props = {
  value: number;
};

const AnimatedNumber: FC<Props> = ({ value }: any) => {
  const [initialised, setInitialised] = useState<boolean>(false);
  const first = useRef<any>();

  const playAnimation = () => {
    if (!initialised) {
      setInitialised(true); // not on the first load
      return;
    }

    // doing this programmatically to reset the progress
    // on value change before animation finishes
    first.current.animation.progressStep(0);
    first.current.animation.play();
  };
  useEffect(playAnimation, [value, first]);

  return (
    <CreateAnimation
      duration={2500}
      ref={first}
      fromTo={[
        { property: 'color', fromValue: '#2c3400', toValue: '' },
        { property: 'background', fromValue: '#91a71c2b', toValue: '' },
      ]}
    >
      <span className="animated-number">{value}</span>
    </CreateAnimation>
  );
};

export default AnimatedNumber;
