import Sample from '../sample';
import Occurrence from '../occurrence';
import recordManager from '../../record_manager';
import DateHelp from 'helpers/date';


function getRandomSample() {
  const occurrence = new Occurrence({
    taxon: { warehouse_id: 166205 },
  });
  const sample = new Sample({
    location: {
      latitude: 12.12,
      longitude: -0.23,
      name: 'automatic test'},
  }, {
    occurrences: [occurrence],
    manager: recordManager,
    onSend: () => {}, // overwrite manager's one checking for user login
  });

  sample.metadata.saved = true;

  return sample;
}

describe('Sample', () => {
  it('should have current date by default', () => {
    const sample = new Sample();
    const date = sample.get('date');

    expect(DateHelp.print(date)).to.be.equal(DateHelp.print(new Date()));
  });

  describe('validation', () => {
    it('should return sample send false invalid if not saved', () => {
      const sample = new Sample();
      expect(sample.validate).to.be.a('function');
      sample.clear();

      const invalids = sample.validate();
      expect(invalids.sample.send).to.be.false;
    });

    it('should return sample and occurrence objects with invalids', () => {
      const sample = new Sample();
      expect(sample.validate).to.be.a('function');
      sample.metadata.saved = true;
      sample.clear();

      let invalids = sample.validate({});
      expect(invalids).to.be.an('object')
        .and.have.property('sample')
        .and.have.property('occurrences');

      // sample
      expect(invalids.sample).to.have.property('date');
      expect(invalids.sample).to.have.property('location');
      expect(invalids.sample).to.have.property('location name');
      expect(invalids.sample).to.have.property('location_type');
      expect(invalids.sample).to.have.property('occurrences');

      // occurrence
      expect(invalids.occurrences)
        .to.be.an('object')
        .and.to.be.empty;

      const occurrence = new Occurrence();
      sample.addOccurrence(occurrence);
      invalids = sample.validate();
      expect(invalids.occurrences).to.not.be.empty;
      expect(invalids.occurrences).to.have.property(occurrence.cid);
    });
  });

  describe('setToSend', () => {
    it('should set the saved flag in sample metadata', () => {
      const sample = getRandomSample();
      const promise = sample.setToSend();
      expect(sample.metadata.saved).to.be.true;
    });

    it('should return a promise', () => {
      const sample = getRandomSample();
      const promise = sample.setToSend();
      expect(promise).to.be.an('object');
    });

    it('should not send if invalid, but set validationError', () => {
      const sample = new Sample();
      const valid = sample.setToSend();
      expect(valid).to.be.false;

      expect(sample.validationError).to.be.an('object');
      expect(sample.metadata.saved).to.be.false;
    });
  });

  describe('GPS extension', () => {
    it('has GPS functions', () => {
      const sample = new Sample();
      expect(sample.startGPS).to.be.a('function');
      expect(sample.stopGPS).to.be.a('function');
      expect(sample.isGPSRunning).to.be.a('function');
    });
  });
});
