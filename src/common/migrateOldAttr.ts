/* eslint-disable no-param-reassign */
import { BlockConf } from '@flumens/tailwind/dist/Survey';

/**
 * migrates old attribute format to new block-based format
 */
export default function migrateOldAttr(
  record: Record<string, any>,
  oldAttr: { id: string; remote?: any },
  newAttr: Pick<BlockConf, 'id'>
) {
  const oldName = oldAttr.id;
  const oldValue = record[oldName];

  // if no old attribute is set then return
  if (oldValue === undefined || oldValue === null || oldValue === '') return;

  const newRecord: any = {};

  const isChoiceValue = Array.isArray(oldAttr.remote?.values);
  const isFunctionValue = typeof oldAttr.remote?.values === 'function';
  if (isChoiceValue) {
    const valueMap = oldAttr.remote!.values as any[];

    const findMatchingValue = (value: any) =>
      valueMap.find(
        v => v.value === value || v.id === value || `${v.id}` === `${value}`
      );

    const isMultichoice = Array.isArray(oldValue);
    if (isMultichoice) {
      // handle multi-choice values
      newRecord[newAttr.id] = oldValue
        .map(value => findMatchingValue(value)?.id)
        .filter(Boolean);
    } else {
      const remoteValue = findMatchingValue(oldValue);
      if (remoteValue?.id) {
        newRecord[newAttr.id] = String(remoteValue.id);
      }
    }
  } else if (isFunctionValue) {
    newRecord[newAttr.id] = (oldAttr as any).remote.values(oldValue, {
      values: newRecord,
    });
  } else {
    // direct value migration
    newRecord[newAttr.id] =
      typeof oldValue === 'object'
        ? JSON.parse(JSON.stringify(oldValue))
        : oldValue;
  }

  // clean up old attribute
  if (oldName !== newAttr.id) delete record[oldName];

  Object.assign(record, newRecord);
}
