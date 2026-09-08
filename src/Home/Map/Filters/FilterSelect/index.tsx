import type { SelectCustomEvent } from '@ionic/react';
import { IonSelect, IonSelectOption } from '@ionic/react';
import './styles.scss';

type Option = { value: string; label: string };

type Props = {
  options: Option[];
  onChange: (value: string) => void;
  value?: string;
};

const FilterSelect = ({ options, onChange, value: valueProp }: Props) => {
  const getOption = ({ value, label }: Option) => (
    <IonSelectOption
      className="filter-option"
      key={value + label}
      value={value}
    >
      {label}
    </IonSelectOption>
  );
  const optionItems = options.map(getOption);

  const onChangeWrap = (event: SelectCustomEvent<string>) =>
    onChange(event.detail.value);

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
