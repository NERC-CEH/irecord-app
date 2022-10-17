import { FC } from 'react';
import { isPlatform } from '@ionic/react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LongPressButton } from '@flumens';
import AnimatedNumber from './AnimatedNumber';
import './styles.scss';

interface Props {
  onClick: any;
  onLongClick?: any;
  value: number;
  disabled?: boolean;
}

const IncrementalButton: FC<Props> = ({
  onClick: onClickProp,
  onLongClick: onLongClickProp,
  value,
  disabled,
}) => {
  const isNumber = Number.isFinite(value);

  const onClick = () => {
    if (disabled || !isNumber) return;

    onClickProp();

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });
  };

  const onLongClick = () => {
    if (disabled || !isNumber) return;

    if (!onLongClickProp) {
      onClickProp();
      return;
    }

    onLongClickProp();

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });
  };

  let valueItem;
  if (isNumber) {
    valueItem = <AnimatedNumber value={value} />;
  } else if (value) {
    valueItem = <span className="empty">{value}</span>;
  } else {
    valueItem = <span className="empty">N/A</span>;
  }

  return (
    <LongPressButton
      className="incremental-button"
      onClick={onClick}
      fill="clear"
      onLongClick={onLongClick}
      longClickDuration={700}
    >
      {valueItem}
      <div className="label-divider" />
    </LongPressButton>
  );
};

export default IncrementalButton;
