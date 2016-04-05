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

  const RECORD_COUNT = 1;
  it(`should be able to send ${RECORD_COUNT} records`, (done) => {
    //function createDummyRecord() {
    //  const occurrence = new Occurrence();
    //  //occurrence.images.set(image);
    //
    //  const sample = new Sample(null, {
    //    occurrences: [occurrence],
    //  });
    //
    //  recordManager.set(sample, (saveErr) => {
    //    if (saveErr) throw saveErr.message;
    //
    //    recordManager.syncAll((syncErr) => {
    //      if (syncErr) throw syncErr.message;
    //
    //      expect(sample.getSyncStatus()).to.be.equal(Morel.SYNCED);
    //      done();
    //    })
    //  });
    //}
    //
    //createDummyRecord();
  });
});
