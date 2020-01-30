import { AppModel } from 'app_model';

describe('App Model attr locks extension', () => {
  let localStorageStub;
  before(() => {
    localStorageStub = sinon.stub(AppModel.prototype, 'save').returns(() => {});
  });
  after(() => {
    localStorageStub.restore();
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

    it('should return null if container or lock doesn\'t exist', () => {
      // Given
      const appModel = new AppModel();
      appModel.attrs.attrLocks = { A: {} };

      // When
      const lock = appModel.getAttrLock('smp', 'A', 'b')
      const lock2 = appModel.getAttrLock('smp', 'B', 'c')
    
      // Then
      expect(lock).to.be.equal(null);
      expect(lock2).to.be.equal(null);
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
