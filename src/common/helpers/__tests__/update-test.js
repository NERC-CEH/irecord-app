import appModel from 'app_model';
import CONFIG from 'config';
import Sample from 'sample';
import Occurrence from 'occurrence';
import Update, { updateSamples } from '../update';
import savedSamples from '../../saved_samples';

/* eslint-disable */

Update.updatesSeq = ['3.0.0', '3.1.2', '3.2.0', '4.0.0'];

Update.updates = {
  '3.0.0': function(callback) {
    callback();
  },
  '3.1.2': function(callback) {
    callback();
  },
  '3.2.0': function(callback) {
    callback();
  },
  '4.0.0': function(callback) {
    callback();
  },
};

let applyUpdatesSpy, spy1, spy2, spy3, spy4;

describe.skip('Update', () => {
  beforeEach(() => {
    applyUpdatesSpy = sinon.spy(Update, '_applyUpdates');

    spy1 = sinon.spy(Update.updates, '3.0.0');
    spy2 = sinon.spy(Update.updates, '3.1.2');
    spy3 = sinon.spy(Update.updates, '3.2.0');
    spy4 = sinon.spy(Update.updates, '4.0.0');
  });

  afterEach(() => {
    applyUpdatesSpy.restore();

    spy1.restore();
    spy2.restore();
    spy3.restore();
    spy4.restore();
  });

  it('should find first update in chain', () => {
    const currentVersion = '3.1.2'; // this update has been applied so next is 3.2.0
    const firstUpdate = Update._findFirst(Update.updatesSeq, currentVersion);
    expect(firstUpdate).to.be.equal(2);
  });

  // it('should update app version', (done) => {
  //   appModel.set('appVersion', '3.2.0');
  //   CONFIG.version = '4.0.0';
  //   Update.run(() => {
  //     expect(appModel.get('appVersion')).to.be.equal('4.0.0');
  //     expect(spy3.called).to.be.false;
  //
  //     appVerSpy.reset();
  //     Update.run(() => {
  //       expect(appVerSpy.called).to.be.false;
  //       done();
  //     });
  //   }, true);
  // });
  //
  // it('should apply each update in sequence and update app version', (done) => {
  //   appModel.set('appVersion', '3.1.1');
  //   CONFIG.version = '4.1.0';
  //   Update.run(() => {
  //     expect(spy1.calledOnce).to.be.false;
  //     expect(spy2.calledOnce).to.be.true;
  //     expect(spy3.calledOnce).to.be.true;
  //     expect(spy4.calledOnce).to.be.true;
  //
  //     sinon.calledInOrder(spy2, spy3, spy4);
  //     done();
  //   }, true);
  // });

  it('should not call any update if no update with new version', done => {
    appModel.set('appVersion', '4.0.0');
    CONFIG.version = '4.1.0';
    Update.run(() => {
      expect(applyUpdatesSpy.called).to.be.false;
      done();
    });
  });
});
