import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { chevronDownSharp, listOutline } from 'ionicons/icons';
import { Trans as T, useTranslation } from 'react-i18next';
import { AttrProps, Button, useAlert, useToast } from '@flumens';
import Checkbox from '@flumens/tailwind/dist/components/Checkbox';
import { IonIcon, IonActionSheet } from '@ionic/react';
import Occurrence from 'common/models/occurrence';
import Sample from 'common/models/sample';
import EditModal from './EditModal';

function useDeletePrompt() {
  const alert = useAlert();

  const showDeleteOccurrenceDialog = async () => {
    return new Promise<boolean>(resolve => {
      alert({
        header: 'Delete',
        message: 'Are you sure you want to delete the selected entries?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => resolve(false),
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: () => resolve(true),
          },
        ],
      });
    });
  };

  return showDeleteOccurrenceDialog;
}

export type Action = 'delete' | 'stage' | 'sex' | 'comment' | 'cancel';

type BulkEditContextType = {
  bulkEditItems: string[];
  setBulkEditItems: (items: string[]) => void;
  models: Sample[] | Occurrence[];
  onBulkEdit?: (action: Action, modelIds: string[], value?: any) => void;
  isBulkEditing: boolean;
  setIsBulkEditing: (isEditing: boolean) => void;
  onCancelBulkEdit: () => void;
  setIsOpen: (isOpen: boolean) => void;
  onEditChange: (isEditing: boolean) => void;
};

const BulkEditContext = createContext<BulkEditContextType | undefined>(
  undefined
);

const useBulkEditContext = () => {
  const context = useContext(BulkEditContext);

  if (!context) {
    throw new Error('useBulkEditContext must be used within BulkEdit');
  }

  return context;
};

const Control = () => {
  const {
    bulkEditItems,
    setBulkEditItems,
    models,
    onBulkEdit,
    isBulkEditing,
    setIsBulkEditing,
    onCancelBulkEdit,
    setIsOpen,
    onEditChange,
  } = useBulkEditContext();

  const onToggleAll = () =>
    !bulkEditItems.length
      ? setBulkEditItems(models.map((m: any) => m.cid))
      : setBulkEditItems([]);

  const showBulkActions = () => setIsOpen(true);

  return (
    <>
      {!!onBulkEdit && !isBulkEditing && (
        <IonIcon
          icon={listOutline}
          mode="md"
          className="size-5 p-0"
          onClick={() => {
            onEditChange(true);
            setIsBulkEditing(true);
          }}
        />
      )}

      {isBulkEditing && (
        <div className="flex gap-2 justify-between items-center w-full">
          <div className="flex gap-4 items-center">
            <Button
              onPress={showBulkActions}
              className="px-2 py-0.5"
              suffix={<IonIcon className="size-5" icon={chevronDownSharp} />}
              isDisabled={!bulkEditItems.length}
            >
              Bulk action
            </Button>

            <div onClick={onToggleAll} className="text-sm">
              <T>Toggle all</T>
            </div>
          </div>

          <div
            onClick={onCancelBulkEdit}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm cursor-pointer hover:bg-gray-100"
          >
            <T>Cancel</T>
          </div>
        </div>
      )}
    </>
  );
};

type Props = {
  onBulkEdit?: (action: Action, modelIds: string[], value?: any) => void;
  onEditChange: (isEditing: boolean) => void;
  models: Sample[] | Occurrence[];
  children: ReactNode;
};

const BulkEdit = ({ onBulkEdit, onEditChange, models, children }: Props) => {
  const { t } = useTranslation();
  const toast = useToast();

  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkEditItems, setBulkEditItems] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [valueEditConfig, setValueEditConfig] = useState<
    AttrProps & { attr: Action }
  >();
  const showDeleteConfirmation = useDeletePrompt();

  const getSurveyConfig = (cid: string) =>
    models.find(smp => smp.cid === cid)?.getSurvey();

  const onCancelBulkEdit = useCallback(() => {
    setIsOpen(false);
    setBulkEditItems([]);
    onEditChange(false);
    setIsBulkEditing(false);
  }, [onEditChange]);

  const processBulkAction = async (action: Action) => {
    if (action === 'delete') {
      const shouldDelete = await showDeleteConfirmation();
      if (!shouldDelete) return;

      onBulkEdit!(action, bulkEditItems, null);
      onCancelBulkEdit();
      return;
    }

    const isSubSample = models[0] instanceof Sample;
    const surveys = bulkEditItems.map(getSurveyConfig).filter(s => !!s);
    const hasDifferentSurveys = surveys.some((s, _, a) => s.taxa !== a[0].taxa);
    if (hasDifferentSurveys) {
      toast.warn(
        'Only entries within the same species group can be edited in bulk.'
      );
      return;
    }

    const config = isSubSample
      ? surveys[0].occ?.attrs[action]
      : surveys[0].attrs![action];

    if (!config) {
      toast.warn(`No ${action} attribute found for the selected entries.`);
      return;
    }

    setValueEditConfig({
      ...(config.pageProps?.attrProps as AttrProps),
      attr: action,
    });
  };

  const onNewValueSave = (newValue?: any) => {
    if (newValue) onCancelBulkEdit();
    if (valueEditConfig?.attr)
      onBulkEdit!(valueEditConfig!.attr, bulkEditItems, newValue);
    setValueEditConfig(undefined);
  };

  const onActionSheetDismiss = async (event: any) => {
    setIsOpen(false);
    const action = event.detail.data?.action as Action;
    if (action !== 'cancel') processBulkAction(action);
  };

  const contextValue = useMemo(
    () => ({
      bulkEditItems,
      setBulkEditItems,
      models,
      onBulkEdit,
      isBulkEditing,
      setIsBulkEditing,
      onCancelBulkEdit,
      setIsOpen,
      onEditChange,
    }),
    [
      bulkEditItems,
      models,
      onBulkEdit,
      isBulkEditing,
      onCancelBulkEdit,
      onEditChange,
    ]
  );

  return (
    <BulkEditContext.Provider value={contextValue}>
      <Checkbox
        onChange={(newItems: any) => setBulkEditItems(newItems)}
        value={bulkEditItems}
        className="[&>div]:px-0!"
      >
        {children}
      </Checkbox>

      <IonActionSheet
        onDidDismiss={onActionSheetDismiss}
        isOpen={isOpen}
        header="Bulk edit actions"
        buttons={[
          {
            text: t('Stage'),
            data: { action: 'stage' },
          },
          {
            text: t('Sex'),
            data: { action: 'sex' },
          },
          {
            text: t('Comment'),
            data: { action: 'comment' },
          },
          {
            text: t('Delete'),
            role: 'destructive',
            data: { action: 'delete' },
            cssClass: '!text-danger-700',
          },
          {
            text: t('Cancel'),
            role: 'cancel',
            data: { action: 'cancel' },
            cssClass: '!text-success-700',
          },
        ]}
      />

      <EditModal config={valueEditConfig} onSave={onNewValueSave} />
    </BulkEditContext.Provider>
  );
};

BulkEdit.Control = Control;

export default BulkEdit;
