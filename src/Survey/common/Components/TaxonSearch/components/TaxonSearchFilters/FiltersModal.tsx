import { useEffect, useContext, useState, Fragment } from 'react';
import { chevronDownOutline, chevronForwardOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Button, CheckboxInput, Main, RadioInput } from '@flumens';
import {
  IonButtons,
  IonToolbar,
  IonHeader,
  IonTitle,
  IonButton,
  IonModal,
  NavContext,
  IonIcon,
} from '@ionic/react';
import { capitalize } from 'common/helpers/string';
import appModel from 'common/models/app';
import filters from './filters';

type Props = {
  onTaxaFilterChange: (newFilters: number[][]) => void;
  onNameFilterChange: (e: any) => void;
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

const parseStringArray = (stringArray: string[]): number[][] =>
  stringArray.map((s: string) => JSON.parse(s));

const FiltersModal = ({
  onTaxaFilterChange,
  onNameFilterChange,
  toggleModal,
  showModal,
}: Props) => {
  useDisableBackButton(toggleModal, showModal);

  const { searchNamesOnly, taxonSearchGroupFilters } = appModel.data;

  const currentTaxaFilters = taxonSearchGroupFilters.map((s: any) =>
    JSON.stringify(s)
  );

  const [isExpanded, setIsExpanded] = useState('');

  const taxaMultiGroupValues: string[] = [];

  const taxaFilterOptions = Object.entries(filters).map(
    ([filterName, options]: any) => {
      const hasSubFilters = !Array.isArray(options);
      if (!hasSubFilters)
        return {
          label: capitalize(filterName),
          value: JSON.stringify(options),
        };

      const subFilters = Object.keys(options).map((subFilterName: string) => ({
        label: capitalize(subFilterName),
        value: JSON.stringify((options as any)[subFilterName]),
      }));

      // caching for easier lookups
      taxaMultiGroupValues.push(JSON.stringify(Object.values(options)));

      return {
        label: capitalize(filterName),
        value: JSON.stringify(Object.values(options)),
        subFilters,
      };
    }
  );

  const onSearchGroupFilterChangeWrap = (newSelectedFilters: string[]) => {
    const hasUnchecked = newSelectedFilters.length < currentTaxaFilters.length;
    if (hasUnchecked) {
      onTaxaFilterChange(parseStringArray(newSelectedFilters));
      return;
    }

    const lastAdded = newSelectedFilters.at(-1);
    if (!lastAdded) {
      onTaxaFilterChange([]);
      return;
    }

    const isMultiGroupValue = taxaMultiGroupValues.includes(lastAdded);
    if (isMultiGroupValue) {
      const multiGroupValue = lastAdded;
      // remove existing multi-group child filters
      const cleanedFilters = newSelectedFilters.filter(
        s => !multiGroupValue.includes(s)
      );
      const cleanedFiltersFull = [...cleanedFilters, multiGroupValue];
      onTaxaFilterChange(parseStringArray(cleanedFiltersFull));
      return;
    }

    // remove exiting multi-group filter (if exists)
    const cleanedFilters = currentTaxaFilters.filter(
      (s: string) => !s.includes(lastAdded) // multi-group top level filter will contain the individual options, so this will filter the top-level groupings
    );
    const cleanedFiltersFull = [...cleanedFilters, lastAdded];
    onTaxaFilterChange(parseStringArray(cleanedFiltersFull));
  };

  const taxaFilterOptionItems = taxaFilterOptions.map(
    ({ label, value, subFilters }: any) => {
      const hasSelectedSomeSubFilters = !subFilters
        ? false
        : subFilters.some(({ value: subFilterValue }: any) =>
            currentTaxaFilters.includes(subFilterValue)
          );

      const subFilterOptionItems = subFilters?.map((subFilter: any) => (
        <CheckboxInput.Option
          label={subFilter.label}
          value={subFilter.value}
          className="w-full"
          key={subFilter.label}
        />
      ));

      return (
        <Fragment key={label}>
          <div className="flex w-full gap-1">
            <CheckboxInput.Option
              label={label}
              value={value}
              className="w-full"
              isIndeterminate={hasSelectedSomeSubFilters}
            />
            {subFilters && (
              <Button
                slot="icon"
                shape="round"
                fill="clear"
                className="p-3"
                onPress={() => setIsExpanded(isExpanded !== value ? value : '')}
              >
                <IonIcon
                  icon={
                    isExpanded === value
                      ? chevronDownOutline
                      : chevronForwardOutline
                  }
                  className="size-6 opacity-80"
                />
              </Button>
            )}
          </div>

          {isExpanded === value && (
            <div className="mr-6 flex flex-col gap-2 border-r border-neutral-500/40 pr-6">
              {subFilterOptionItems}
            </div>
          )}
        </Fragment>
      );
    }
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
      <Main fullscreen>
        <div id="filters-dialog-form">
          <h3 className="list-title">
            <T>Names:</T>
          </h3>
          <RadioInput
            onChange={onNameFilterChange}
            value={searchNamesOnly || ''}
            options={[
              { label: 'Default', value: '' },
              { label: 'Common only', value: 'common' },
              { label: 'Scientific only', value: 'scientific' },
            ]}
          />
        </div>

        <div className="taxon-groups taxa-filter-edit-dialog-form">
          <h3 className="list-title">
            <T>Taxon groups:</T>
          </h3>
          <CheckboxInput
            onChange={onSearchGroupFilterChangeWrap}
            value={currentTaxaFilters}
          >
            {taxaFilterOptionItems}
          </CheckboxInput>
        </div>
      </Main>
    </IonModal>
  );
};

export default FiltersModal;
