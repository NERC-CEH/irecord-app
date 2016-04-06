import Morel from 'morel';
import recordManager from '../record_manager';
import Sample from '../sample';
import Occurrence from '../occurrence';

describe('Record Manager', () => {
  after((done) => {
    recordManager.clear(done);
  });

  it('should be a Morel Manager', () => {
    expect(recordManager).to.be.instanceOf(Morel);
  });


  function getRandomSample() {
    const occurrence = new Occurrence({
      taxon: 1234,
    });
    const sample = new Sample({
      location: ' 12.12, -0.23',
    }, {
      occurrences: [occurrence],
      manager: recordManager,
    });

    return sample;
  }

  const RECORD_COUNT = 1;
  it(`should be able to send ${RECORD_COUNT} records`, (done) => {
    const sample = getRandomSample();

    recordManager.set(sample, (saveErr) => {
      if (saveErr) throw saveErr.message;

      recordManager.syncAll()
        .then(() => {
          expect(sample.getSyncStatus()).to.be.equal(Morel.SYNCED);
          done();
        });
    });
  });
});
