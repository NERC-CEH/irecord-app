/* eslint-disable consistent-return */
import { useEffect, useState } from 'react';
import { Trans as T } from 'react-i18next';
import { AttrProps, Block, Main, useOnHideModal } from '@flumens';
import { ChoiceInputConf, TextInputConf } from '@flumens/tailwind/dist/Survey';
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

const getBlockConfig = (attrProps?: AttrProps) => {
  if (!attrProps) return;

  // Example for different attribute types
  if (attrProps.input === 'radio')
    return {
      id: attrProps.attr,
      type: 'choiceInput',
      choices: attrProps.inputProps.options.map((option: any) => ({
        dataName: `${option.value}`,
        title: option.label || `${option.value}`,
      })),
    } satisfies ChoiceInputConf;

  if (attrProps.input === 'textarea')
    return {
      id: attrProps.attr,
      type: 'textInput',
      appearance: 'multiline',
      className: 'm-2',
    } satisfies TextInputConf;

  throw new Error(`Unsupported attribute type (${attrProps.attr}) for editing`);
};

type Props = {
  config?: AttrProps;
  onSave: (newValue?: any) => void;
};

const EditModal = ({ config, onSave }: Props) => {
  const [value, setValue] = useState();
  const closeModal = () => onSave();

  useEffect(() => {
    setValue(undefined);
  }, [config]);

  useOnHideModal(onSave);

  const save = () => onSave(value);

  // we can drop this when we support Block attributes
  const blockConfig = getBlockConfig(config);

  return (
    <IonModal
      isOpen={!!config}
      backdropDismiss={false}
      backdropBreakpoint={0.5}
      breakpoints={[0.7, 1]}
      initialBreakpoint={0.7}
      canDismiss
      onIonModalWillDismiss={closeModal}
      className="[&::part(handle)]:mt-2"
    >
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={closeModal}>
              <T>Cancel</T>
            </IonButton>
          </IonButtons>
          <IonTitle class="capitalize">
            <T>{config?.attr}</T>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={save}>
              <T>Save</T>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <Main>
        <div className="my-2">
          {!!blockConfig && (
            <Block block={blockConfig!} record={{}} onChange={setValue} />
          )}
        </div>
      </Main>
    </IonModal>
  );
};

export default EditModal;
