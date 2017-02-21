import validate from '../validate';
import device from '../device';
import analytics from '../analytics';
import appModel from 'app_model';
import CONFIG from 'config';

describe('Validate', function () {
  it('should detect correct email', function () {
    expect(validate.email('test@test.com')).to.be.true;
    expect(validate.email('testtest.com')).to.be.false;
    expect(validate.email('test@test')).to.be.false;
  });
});

describe('Analytics', () => {
  let isOnline;
  before(() => {
    CONFIG.log.ga_error = true;
    analytics.initialized = true;
  });

  after(() => {
    analytics.initialized = false;
  });

  beforeEach(() => {
    window.analytics = {
      trackException() {},
    };

    sinon.spy(window.analytics, 'trackException');
    isOnline = sinon.stub(device, 'isOnline');
    isOnline.returns(true);
  });

  afterEach(() => {
    window.analytics.trackException.restore();
    isOnline.restore();
  });

  it('should send an exception', () => {
    expect(analytics.trackException).to.be.a('function');
    analytics.trackException({
      message: 'my error',
    });

    expect(window.analytics.trackException.called).to.be.true;
  });

  it('should store and send an offline exception', () => {
    expect(appModel.get('exceptions')).to.be.an('array');

    isOnline.returns(false);
    analytics.trackException({
      message: 'my error',
    });
    expect(window.analytics.trackException.called).to.be.false;

    isOnline.returns(true);
    analytics.trackException({
      message: 'my error 2',
    });
    expect(window.analytics.trackException.calledTwice).to.be.true;
  });
});
