import radio from 'radio';
import showErrMsg from '../show_err_msg';

describe('Helpers showErrMsg', () => {
  let radioTriggerStub;
  beforeEach(() => {
    radioTriggerStub = sinon.stub(radio, 'trigger');
  });
  afterEach(() => {
    radioTriggerStub.restore();
  });

  it('should call radio error', () => {
    const err = 'msg';
    showErrMsg(err);

    expect(radioTriggerStub.calledOnce).to.equal(true);
    expect(radioTriggerStub.calledWith('app:dialog:error', err)).to.equal(true);
  });

  it('should show default err message error passed is not string', () => {
    const defaultErrMsg = 'Sorry, some problem has occurred';
    showErrMsg({});
    expect(
      radioTriggerStub.calledWith('app:dialog:error', defaultErrMsg)
    ).to.equal(true);
  });
});
