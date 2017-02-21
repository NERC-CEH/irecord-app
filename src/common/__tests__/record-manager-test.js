import Morel from 'morel';
import Backbone from 'backbone';
import Sample from 'sample';
import savedSamples from 'saved_samples';
import userModel from 'user_model';
import appModel from 'app_model';
import Occurrence from 'occurrence';

describe('Saved collection', () => {
  let server;

  // const store = new Store();
  // const savedSamples = new Collection([], { store, model: Sample });

  const okResponse = [200, { 'Content-Type': 'text/html' }, ''];

  let userLogin;
  before(() => {
    server = sinon.fakeServer.create();
    userLogin = sinon.stub(userModel, 'hasLogIn').returns(true);
  });

  after((done) => {
    this.timeout(5000);
    userLogin.reset();
    // clean up in case of trash
    savedSamples.fetch()
      .then(() => savedSamples.destroy())
      .then(() => done());
  });

  it('should be a Morel Manager', () => {
    expect(savedSamples).to.be.instanceOf(Morel);
  });


  function getRandomSample() {
    const occurrence = new Occurrence({
      taxon: { warehouse_id: 166205 },
    });
    const sample = new Sample({
      location: {
        latitude: 12.12,
        longitude: -0.23,
        name: 'automatic test' },
    }, {
      occurrences: [occurrence],
      manager: savedSamples,
    });

    sample.metadata.saved = true;

    return sample;
  }

  const SAMPLE_COUNT = 500;
  it(`should be able to send ${SAMPLE_COUNT} samples`, function (done) {
    this.timeout(5000);

    const samples = [];
    for (let i = 0; i < SAMPLE_COUNT; i++) {
      samples.push(getRandomSample());
    }
    const collection = new Backbone.Collection(samples);

    savedSamples.syncAll(null, collection)
      .then(() => {
        collection.each((sample) => {
          expect(sample.getSyncStatus()).to.be.equal(Morel.SYNCED);
        });
        done();
      });

    // needs timeout because syncAll is async and returns before the POST call
    setTimeout(() => {
      server.respondWith('POST', savedSamples.options.url, okResponse);
      server.respond();
    });
  });

  it('should set occurrence to training mode', () => {
    appModel.set('useTraining', false);

    const sample = getRandomSample();
    sample.save({ remote: true });
    expect(sample.getOccurrence().get('training')).to.be.equal(false);

    appModel.set('useTraining', true);

    const sample2 = getRandomSample();
    sample2.save({ remote: true });
    expect(sample2.getOccurrence().get('training')).to.be.equal(true);
  });
});
