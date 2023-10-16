import { FC } from 'react';
import { IonSelect, IonSelectOption } from '@ionic/react';
import './styles.scss';

type Option = {
  value?: string;
  label?: string;
  icon?: string;
  isDefault?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
};

type Props = {
  options: Option[];
  onChange: any;
  value: any;
};

const FilterSelect: FC<Props> = ({ options, onChange, value: valueProp }) => {
  const getOption = ({ value, label }: any) => (
    <IonSelectOption
      className="filter-option"
      key={value + label}
      value={value}
    >
      {label}
    </IonSelectOption>
  );
  const optionItems = options.map(getOption);

  const onChangeWrap = (e: any) => onChange(e.detail.value);

  return (
    <IonSelect
      value={valueProp}
      className="filter-select"
      onIonChange={onChangeWrap}
    >
      {optionItems}
    </IonSelect>
  );
};

export default FilterSelect;
