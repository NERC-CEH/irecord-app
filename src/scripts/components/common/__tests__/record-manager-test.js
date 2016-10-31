import Morel from 'morel';
import Backbone from 'backbone';
import recordManager from '../record_manager';
import userModel from '../models/user_model';
import appModel from '../models/app_model';
import Sample from '../models/sample';
import Occurrence from '../models/occurrence';

describe('Record Manager', () => {
  let server;

  const okResponse = [200, { 'Content-Type': 'text/html' }, ''];
  const errResponse = [502, { 'Content-Type': 'text/html' }, ''];

  let userLogin;
  before(() => {
    server = sinon.fakeServer.create();
    userLogin = sinon.stub(userModel, 'hasLogIn').returns(true);
  });

  after((done) => {
    recordManager.clear(done);
    userLogin.reset();
  });

  it('should be a Morel Manager', () => {
    expect(recordManager).to.be.instanceOf(Morel);
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
      manager: recordManager,
    });

    sample.metadata.saved = true;

    return sample;
  }

  const RECORD_COUNT = 200;
  it(`should be able to send ${RECORD_COUNT} records`, function (done) {
    const samples = [];
    for (let i = 0; i < RECORD_COUNT; i++) {
      samples.push(getRandomSample());
    }
    const collection = new Backbone.Collection(samples);

    recordManager.syncAll(null, collection)
      .then(() => {
        collection.each((sample) => {
          expect(sample.getSyncStatus()).to.be.equal(Morel.SYNCED);
        });
        done();
      });

    server.respondWith('POST', 'http://192.171.199.230/irecord7/mobile/submit', okResponse);
    server.respond();
  });

  it ('should set occurrence to training mode', () => {
    appModel.set('useTraining', false);

    const sample = getRandomSample();
    sample.save(null, { remote: true });
    console.log(sample.occurrences.at(0).attributes)
    expect(sample.occurrences.at(0).get('training')).to.be.equal(false);

    appModel.set('useTraining', true);

    const sample2 = getRandomSample();
    sample2.save(null, { remote: true });
    console.log(sample2.occurrences.at(0).attributes)
    expect(sample2.occurrences.at(0).get('training')).to.be.equal(true);
  });
});
