import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { chevronDownSharp, listOutline } from 'ionicons/icons';
import { CheckboxGroup } from 'react-aria-components';
import { Trans as T, useTranslation } from 'react-i18next';
import { AttrProps, Button, useAlert, useToast } from '@flumens';
import { IonIcon, IonActionSheet } from '@ionic/react';
import Occurrence from 'common/models/occurrence';
import Sample from 'common/models/sample';
import EditModal from './EditModal';

type ValueEditConfig = AttrProps & { attrConfig: any; title?: string };

const getValueConfig = (
  config: any,
  action: string
): ValueEditConfig | null => {
  const block = config.block || config;
  if (!block.type && config.pageProps?.attrProps)
    return {
      ...(config.pageProps.attrProps as AttrProps),
      attrConfig: config,
      attr: action,
      title: config.title || action,
    };

  if (block.type === 'choiceInput') {
    return {
      attrConfig: config,
      attr: block.id,
      title: block.title,
      input: 'radio',
      inputProps: {
        options: block.choices.map(({ dataName, title }: any) => ({
          value: dataName,
          label: title || dataName,
        })),
      },
    } as ValueEditConfig;
  }

  if (block.type === 'textInput') {
    return {
      attrConfig: config,
      attr: block.id,
      title: block.title,
      input: 'textarea',
    } as ValueEditConfig;
  }

  return null;
};

function useDeletePrompt() {
  const alert = useAlert();

  const showDeleteOccurrenceDialog = async () =>
    new Promise<boolean>(resolve => {
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

  return showDeleteOccurrenceDialog;
}

export type Action = string;
type Models = (Sample | Occurrence)[];
type Attrs = Record<Action, any>;
export type BulkEditAttrs = Attrs | ((models: Models) => Attrs);

export type OnBulkEdit = (
  attrConfig: any,
  models: Models,
  value?: any
) => void | Promise<void>;

const onBulkEditDefault: OnBulkEdit = async (attrConfig, models, value) => {
  if (!attrConfig) {
    await Promise.all(models.map(model => model.destroy()));
    return;
  }

  const attr = attrConfig.block || attrConfig;
  await Promise.all(
    models.map(async model => {
      const target = model instanceof Sample ? model.occurrences[0] : model;
      if (!target) return;

      // eslint-disable-next-line no-param-reassign
      (target.data as any)[attr.id] = value;
      await target.save();
    })
  );
};

type BulkEditContextType = {
  bulkEditItems: string[];
  setBulkEditItems: (items: string[]) => void;
  models: Models;
  onBulkEdit?: OnBulkEdit;
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
  attrs: BulkEditAttrs;
  onBulkEdit?: OnBulkEdit;
  onEditChange: (isEditing: boolean) => void;
  models: Models;
  isDisabled?: boolean;
  children: ReactNode;
};

const BulkEdit = ({
  attrs,
  onBulkEdit = onBulkEditDefault,
  onEditChange,
  models,
  isDisabled,
  children,
}: Props) => {
  const { t } = useTranslation();
  const toast = useToast();

  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkEditItems, setBulkEditItems] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [valueEditConfig, setValueEditConfig] = useState<ValueEditConfig>();
  const showDeleteConfirmation = useDeletePrompt();
  const selectedModels = models.filter(model =>
    bulkEditItems.includes(model.cid)
  );
  const availableAttrs =
    typeof attrs === 'function' ? attrs(selectedModels) : attrs;

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

      await onBulkEdit(undefined, selectedModels);

      onCancelBulkEdit();
      return;
    }

    const config = availableAttrs[action];

    if (!config) {
      toast.warn(`No ${action} attribute found for the selected entries.`);
      return;
    }

    const nextValueConfig = getValueConfig(config, action);
    if (!nextValueConfig) {
      toast.warn(`${action} cannot be bulk edited.`);
      return;
    }

    setValueEditConfig({ ...nextValueConfig, attrConfig: config });
  };

  const onNewValueSave = async (newValue?: any) => {
    if (newValue !== undefined) {
      await onBulkEdit(valueEditConfig!.attrConfig, selectedModels, newValue);
      onCancelBulkEdit();
    }
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
      onBulkEdit: isDisabled ? undefined : onBulkEdit,
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
      isDisabled,
      onCancelBulkEdit,
      onEditChange,
    ]
  );

  return (
    <BulkEditContext.Provider value={contextValue}>
      <CheckboxGroup onChange={setBulkEditItems} value={bulkEditItems}>
        {children}
      </CheckboxGroup>

      <IonActionSheet
        onDidDismiss={onActionSheetDismiss}
        isOpen={isOpen}
        header="Bulk edit actions"
        buttons={[
          ...Object.entries(availableAttrs).map(
            ([action, config]: [string, any]) => ({
              text: t(config.block?.title || config.title || action),
              data: { action },
            })
          ),
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
