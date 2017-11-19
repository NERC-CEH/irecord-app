import Occurrence from 'occurrence';
/* eslint-disable no-unused-expressions */

describe('Occurrence', () => {
  it('should validate', () => {
    const occurrence = new Occurrence();
    expect(occurrence.validate).to.be.a('function');
    occurrence.clear();

    const invalids = occurrence.validate(null, { remote: true });
    expect(invalids.attributes)
      .to.be.an('object')
      .and.have.property('taxon');
  });
});
