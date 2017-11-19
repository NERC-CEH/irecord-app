import Indicia from 'indicia';
import savedSamples from 'saved_samples';
// import { getRandomSample, generateSampleResponse } from 'test-helpers';

describe('Saved samples', () => {
  let server;

  before(done => {
    server = sinon.fakeServer.create();
    server.respondImmediately = true;
    // userLogin = sinon.stub(userModel, 'hasLogIn').returns(true);

    // clean up in case of trash
    savedSamples
      .fetch()
      .then(() => savedSamples.destroy())
      .then(() => done());
  });

  beforeEach(done => {
    // clean up in case of trash
    savedSamples
      .fetch()
      .then(() => savedSamples.destroy())
      .then(() => done());
  });

  after(done => {
    // userLogin.reset();

    // clean up afterwards
    savedSamples
      .fetch()
      .then(() => savedSamples.destroy())
      .then(() => done());
  });

  afterEach(done => {
    // clean up afterwards
    savedSamples
      .fetch()
      .then(() => savedSamples.destroy())
      .then(() => done());
  });

  it('should be a Indicia Collection', () => {
    expect(savedSamples).to.be.instanceOf(Indicia.Collection);
  });
  //
  // const SAMPLE_COUNT = 500;
  // it(`should be able to send ${SAMPLE_COUNT} samples`, (done) => {
  //
  //   const samples = [];
  //   for (let i = 0; i < SAMPLE_COUNT; i++) {
  //     samples.push(getRandomSample());
  //   }
  //
  //   // hook onto exact time when ajax is called - it is all async in between
  //   const origCall = Backbone.$.ajax;
  //   const stub = sinon.stub(Backbone.$, 'ajax', (...args) => {
  //     origCall.apply(Backbone.$, args);
  //     generateSampleResponse(server, 'OK', null);
  //   });
  //
  //   savedSamples.set(samples);
  //   savedSamples.save(null, { remote: true })
  //     .then(() => {
  //       savedSamples.each((sample) => {
  //         expect(sample.getSyncStatus()).to.be.equal(Indicia.SYNCED);
  //       });
  //       stub.restore();
  //       done();
  //     });
  // });
});
