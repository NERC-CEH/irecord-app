import Occurrence from '../occurrence';

describe('Occurrence', () => {
  describe('validation', () => {
    it('should return invalids', () => {
      const occurrence = new Occurrence();
      expect(occurrence.validate).to.be.a('function');
      occurrence.clear();

      let invalids = occurrence.validate({});
      expect(invalids).to.be.an('object')
        .and.have.property('taxon');
    });
  });
});
