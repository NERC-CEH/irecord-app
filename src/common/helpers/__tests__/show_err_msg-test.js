import showErrMsg from '../show_err_msg';
import radio from 'radio';

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

    expect(radioTriggerStub.calledOnce).to.be.true;
    expect(radioTriggerStub.calledWith('app:dialog:error', err)).to.be.true;
  });

  it('should show default err message error passed is not string', () => {
    const defaultErrMsg = 'Sorry, some problem has occurred';
    showErrMsg({});
    expect(radioTriggerStub.calledWith('app:dialog:error', defaultErrMsg)).to.be
      .true;
  });
});
