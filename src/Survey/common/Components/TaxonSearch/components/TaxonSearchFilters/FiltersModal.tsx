import { useEffect, useContext } from 'react';
import { Trans as T, useTranslation } from 'react-i18next';
import { CheckboxInput, Main, RadioInput } from '@flumens';
import {
  IonButtons,
  IonToolbar,
  IonHeader,
  IonTitle,
  IonButton,
  IonModal,
  NavContext,
} from '@ionic/react';
import { groups as informalGroups } from 'common/data/informalGroups';
import appModel from 'models/app';

type Props = {
  onSearchTaxaFilterSelect: (e: any) => void;
  onSearchNamesFilterSelect: (e: any) => void;
  toggleModal: () => void;
  showModal: boolean;
};

const useDisableBackButton = (toggleModal: () => void, showModal: boolean) => {
  const { goBack } = useContext(NavContext);

  const disableBackButton = () => {
    const disableHardwareBackButton = (event: any) =>
      event.detail.register(100, () => {
        if (!showModal) {
          goBack();
          return null;
        }

        return toggleModal();
      });

    document.addEventListener('ionBackButton', disableHardwareBackButton);

    const removeEventListener = () =>
      document.removeEventListener('ionBackButton', disableHardwareBackButton);
    return removeEventListener;
  };

  useEffect(disableBackButton, [showModal]);
};

const FiltersModal = ({
  onSearchTaxaFilterSelect,
  onSearchNamesFilterSelect,
  toggleModal,
  showModal,
}: Props) => {
  const { t } = useTranslation();

  useDisableBackButton(toggleModal, showModal);

  const filters = Object.keys(informalGroups)
    .sort((a: string, b: string) =>
      t((informalGroups as any)[a]).localeCompare(t((informalGroups as any)[b]))
    )
    .map((value: string) => ({ value, label: (informalGroups as any)[value] }));

  const { searchNamesOnly, taxonGroupFilters: selectedFilters } =
    appModel.attrs;

  const form = (
    <div id="filters-dialog-form">
      <h3 className="list-title">
        <T>Names:</T>
      </h3>
      <RadioInput
        onChange={onSearchNamesFilterSelect}
        value={searchNamesOnly || ''}
        options={[
          { label: 'Default', value: '' },
          { label: 'Common only', value: 'common' },
          { label: 'Scientific only', value: 'scientific' },
        ]}
      />

      <div className="taxon-groups taxa-filter-edit-dialog-form">
        <h3 className="list-title">
          <T>Taxon groups:</T>
        </h3>
        <div className="capitalize">
          <CheckboxInput
            onChange={onSearchTaxaFilterSelect}
            value={selectedFilters.map((s: number) => `${s}`)}
            options={filters}
          />
        </div>
      </div>
    </div>
  );

  return (
    <IonModal isOpen={showModal}>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>
            <T>Filters</T>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={toggleModal}>
              <T>Close</T>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <Main fullscreen>{form}</Main>
    </IonModal>
  );
};

export default FiltersModal;
