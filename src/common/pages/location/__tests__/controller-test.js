import appModel from 'app_model';
import API from '../controller';

const { show, updateLocationNameLock } = API;

describe('Location Controller', () => {
  it('should have a show method', () => {
    expect(show).to.be.a('function');
  });

  describe('location locks', () => {
    const tempLockValue = true;

    let getAttrLockStub;
    let setAttrLockStub;
    beforeEach(() => {
      getAttrLockStub = sinon.stub(appModel, 'getAttrLock');
      setAttrLockStub = sinon.stub(appModel, 'setAttrLock');
    });
    afterEach(() => {
      getAttrLockStub.restore();
      setAttrLockStub.restore();
    });

    describe('updateLocationNameLock', () => {
      it('should set new lock', () => {
        const newLocationName = 'a location name';
        const nameWasInitiallyLocked = false;
        const currentLockedValue = tempLockValue;
        getAttrLockStub.returns(currentLockedValue);

        updateLocationNameLock(newLocationName, nameWasInitiallyLocked);

        expect(setAttrLockStub.getCall(0).args[1]).to.eql(newLocationName);
      });

      it('should update lock', () => {
        const newLocationName = 'a location name';
        const nameWasInitiallyLocked = true;
        const currentLockedValue = 'old location name';
        getAttrLockStub.returns(currentLockedValue);

        updateLocationNameLock(newLocationName, nameWasInitiallyLocked);

        expect(setAttrLockStub.getCall(0).args[1]).to.eql(newLocationName);
      });

      it('should not update lock if no location name is given', () => {
        const nameWasInitiallyLocked = true;
        const currentLockedValue = 'old location name';
        getAttrLockStub.returns(currentLockedValue);

        updateLocationNameLock(null, nameWasInitiallyLocked);

        expect(setAttrLockStub.calledOnce).to.eql(false);
      });
    });
  });
});
