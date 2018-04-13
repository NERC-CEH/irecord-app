import { AppModel } from 'app_model';

describe('App Model attr locks', () => {
  let localStorageStub;
  before(() => {
    // disable local storage
    localStorageStub = sinon.stub(AppModel.prototype, 'sync').returns(() => {});
  });
  after(() => {
    localStorageStub.restore();
  });

  describe('_extractTypeName', () => {
    it('should exist', () => {
      const appModel = new AppModel();
      expect(appModel._extractTypeName).to.be.a('function');
    });

    it('should extract survey name and type', () => {
      const appModel = new AppModel();
      const surveyConfig = {
        name: 'a',
      };
      expect(appModel._extractTypeName(surveyConfig)).to.be.eql({
        surveyType: 'general',
        surveyName: 'a',
      });
    });

    it('should default to general survey type', () => {
      const appModel = new AppModel();
      const surveyConfig = {
        name: 'a',
      };
      expect(appModel._extractTypeName(surveyConfig).surveyType).to.be.eql(
        'general'
      );
    });
    it('should default to default survey name', () => {
      const appModel = new AppModel();
      const surveyConfig = {};
      expect(appModel._extractTypeName(surveyConfig).surveyName).to.be.eql(
        'default'
      );
    });

    it('should return complex survey if flag set', () => {
      const appModel = new AppModel();
      const surveyConfig = {
        name: 'a',
        complex: true,
      };
      expect(appModel._extractTypeName(surveyConfig)).to.be.eql({
        surveyType: 'complex',
        surveyName: 'a',
      });
    });
  });

  describe('_getRawLocks', () => {
    it('should exist', () => {
      const appModel = new AppModel();
      expect(appModel._getRawLocks).to.be.a('function');
    });

    it('should return all the locks', () => {
      const appModel = new AppModel();
      const attrLocks = { A: { b: 1 } };
      appModel.set('attrLocks', attrLocks);
      expect(appModel._getRawLocks('A', 'b')).to.be.eql(attrLocks);
    });

    it("should initiate new survey if doesn't exit", () => {
      const appModel = new AppModel();
      const attrLocks = { A: {} };
      appModel.set('attrLocks', attrLocks);
      expect(appModel._getRawLocks('A', 'b')).to.be.eql({ A: { b: {} } });
    });

    it("should initiate a survey holder type if doesn't exist", () => {
      const appModel = new AppModel();
      const attrLocks = {};
      appModel.set('attrLocks', attrLocks);
      expect(appModel._getRawLocks('A', 'b')).to.be.eql({ A: { b: {} } });
    });
  });

  describe('setAttrLock', () => {
    it('should exist', () => {
      const appModel = new AppModel();
      expect(appModel.setAttrLock).to.be.a('function');
    });

    it('should set a new attribute lock', () => {
      const appModel = new AppModel();
      appModel.setAttrLock('a', 1);
      const lockedVal = appModel.getAttrLock('a');
      expect(lockedVal).to.eql(1);
    });

    it('should copy new attributes and not references', () => {
      const appModel = new AppModel();
      const value = { a: [1] };
      appModel.setAttrLock('a', value);
      const lockedVal = appModel.getAttrLock('a');
      expect(lockedVal).to.not.equal(value);
      expect(lockedVal.a).to.not.equal(value.a);
    });
  });

  describe('getAttrLock', () => {
    it('should exist', () => {
      const appModel = new AppModel();
      expect(appModel.getAttrLock).to.be.a('function');
    });

    it('should retrieve locked value', () => {
      const appModel = new AppModel();
      appModel.set('attrLocks', { general: { default: { a: 1 } } });
      const lockedVal = appModel.getAttrLock('a');
      expect(lockedVal).to.eql(1);
    });
  });

  describe('unsetAttrLock', () => {
    it('should exist', () => {
      const appModel = new AppModel();
      expect(appModel.unsetAttrLock).to.be.a('function');
    });

    it('should unset locked value', () => {
      const appModel = new AppModel();
      appModel.setAttrLock('a', 1);
      appModel.unsetAttrLock('a');
      const lockedVal = appModel.getAttrLock('a');
      expect(lockedVal).to.be.an('undefined');
    });
  });
});
