/// <reference types="jest" />
import lockExtension from '../attrLockExt';

const sampleLock = ['default', 'arthropods', 'smp', 'a'] as const;
const occurrenceLock = ['default', 'arthropods', 'occ', 'b'] as const;

const createSubject = () => {
  const data = { _attrLocks: {} as Record<string, any> };
  const save = jest.fn();
  const locks = lockExtension(() => data._attrLocks, save);

  return { data, save, locks };
};

describe('Attribute lock extension', () => {
  describe('getAll', () => {
    it('merges default and taxon-group locks', async () => {
      const subject = createSubject();
      await subject.locks.set(...sampleLock, 1);
      await subject.locks.set('default', 'all', 'occ', 'global', 2);

      expect(subject.locks.getAll('default', 'arthropods')).toEqual({
        smp: { a: 1 },
        occ: { global: 2 },
      });
      expect(subject.data._attrLocks).toEqual({
        default: {
          all: { occ: { global: 2 } },
          arthropods: { smp: { a: 1 } },
        },
      });
    });
  });

  describe('set', () => {
    it('sets a new attribute lock', async () => {
      const subject = createSubject();
      await subject.locks.set(...sampleLock, 1);

      expect(subject.locks.get(...sampleLock)).toBe(1);
      expect(subject.locks.isLocked(...sampleLock)).toBe(true);
      expect(subject.save).toHaveBeenCalledTimes(1);
    });

    it('copies new attributes instead of references', async () => {
      const subject = createSubject();
      const value = { a: [1] };
      await subject.locks.set(...sampleLock, value);

      const lockedValue = subject.locks.get(...sampleLock);
      expect(lockedValue).not.toBe(value);
      expect(lockedValue.a).not.toBe(value.a);
    });
  });

  describe('isLocked', () => {
    it('only matches the current record value when provided', async () => {
      const subject = createSubject();
      await subject.locks.set(...sampleLock, { a: [1] });

      expect(subject.locks.isLocked(...sampleLock)).toBe(true);
      expect(subject.locks.isLocked(...sampleLock, { a: [1] })).toBe(true);
      expect(subject.locks.isLocked(...sampleLock, { a: [2] })).toBe(false);
      expect(subject.locks.isLocked(...sampleLock, undefined)).toBe(false);
    });
  });

  describe('get', () => {
    it('retrieves a locked value', () => {
      const subject = createSubject();
      subject.data._attrLocks.default = {
        arthropods: { smp: { a: 1 } },
      };

      expect(subject.locks.get(...sampleLock)).toBe(1);
    });

    it("returns undefined if the container or lock doesn't exist", () => {
      const subject = createSubject();
      subject.data._attrLocks.A = {};

      expect(subject.locks.get(...sampleLock)).toBeUndefined();
      expect(subject.locks.get(...occurrenceLock)).toBeUndefined();
    });
  });

  describe('unset', () => {
    it('unsets a locked value', async () => {
      const subject = createSubject();
      await subject.locks.set(...sampleLock, 1);
      await subject.locks.unset(...sampleLock);

      expect(subject.locks.get(...sampleLock)).toBeUndefined();
      expect(subject.locks.isLocked(...sampleLock)).toBe(false);
      expect(subject.save).toHaveBeenCalledTimes(2);
    });

    it('does not unset an inherited all-taxa lock', async () => {
      const subject = createSubject();
      await subject.locks.set('default', 'all', 'occ', 'global', 2);
      await subject.locks.unset('default', 'arthropods', 'occ', 'global');

      expect(subject.locks.get('default', 'arthropods', 'occ', 'global')).toBe(
        2
      );
    });
  });
});
