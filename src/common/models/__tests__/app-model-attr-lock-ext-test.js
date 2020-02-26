import { AppModel } from 'app_model';
import stringify from 'json-stable-stringify';

describe('App Model attr locks extension', () => {
  let localStorageStub;
  before(() => {
    localStorageStub = sinon.stub(AppModel.prototype, 'save').returns(() => {});
  });
  after(() => {
    localStorageStub.restore();
  });

  describe('getAllLocks', () => {
    it('should return all locks', () => {
      // Given
      const appModel = new AppModel();
      appModel.setAttrLock('smp', 'a', 1);
      appModel.setAttrLock('occ', 'b', 2);

      // When
      const locks = appModel.getAllLocks('smp');

      // Then
      expect(stringify(locks)).to.eql(stringify({ 'occ:b': 2, 'smp:a': 1 }));
    });
  });

  describe('setAttrLock', () => {
    it('should set a new attribute lock', () => {
      const appModel = new AppModel();
      appModel.setAttrLock('smp', 'a', 1);
      const lockedVal = appModel.getAttrLock('smp', 'a');
      expect(lockedVal).to.eql(1);
    });

    it('should copy new attributes and not references', () => {
      const appModel = new AppModel();
      const value = { a: [1] };
      appModel.setAttrLock('smp', 'a', value);
      const lockedVal = appModel.getAttrLock('smp', 'a');
      expect(lockedVal).to.not.equal(value);
      expect(lockedVal.a).to.not.equal(value.a);
    });
  });

  describe('getAttrLock', () => {
    it('should retrieve locked value', () => {
      const appModel = new AppModel();
      appModel.attrs.attrLocks = { default: { default: { 'smp:a': 1 } } };
      const lockedVal = appModel.getAttrLock('smp', 'a');
      expect(lockedVal).to.eql(1);
    });

    it("should return empty if container or lock doesn't exist", () => {
      // Given
      const appModel = new AppModel();
      appModel.attrs.attrLocks = { A: {} };

      // When
      const lock = appModel.getAttrLock('smp', 'A', 'b');
      const lock2 = appModel.getAttrLock('smp', 'B', 'c');

      // Then
      expect(lock).to.be.equal(undefined);
      expect(lock2).to.be.equal(undefined);
    });
  });

  describe('unsetAttrLock', () => {
    it('should unset locked value', () => {
      const appModel = new AppModel();
      appModel.setAttrLock('smp', 'a', 1);

      appModel.unsetAttrLock('a');
      const lockedVal = appModel.getAttrLock('a');
      expect(lockedVal).to.be.an('undefined');
    });
  });
});
