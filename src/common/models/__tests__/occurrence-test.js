import Sample from 'sample';
import Occurrence from 'occurrence';
/* eslint-disable no-unused-expressions */

describe('Occurrence', () => {
  it.skip('should validate', () => {
    const occurrence = new Occurrence();
    expect(occurrence.validate).to.be.a('function');
    occurrence.clear();

    const invalids = occurrence.validate(null, { remote: true });
    expect(invalids.attributes)
      .to.be.an('object')
      .and.have.property('taxon');
  });

  describe.skip('getSurvey', () => {
    let sampleGetSurveySpy;
    beforeEach(() => {
      sampleGetSurveySpy = sinon.spy(Sample.prototype, 'getSurvey');
    });

    afterEach(() => {
      sampleGetSurveySpy.restore();
    });

    it('should exist', () => {
      const occurrence = new Occurrence();
      expect(occurrence.getSurvey).to.be.a('function');
    });

    it('should call parent getSurvey', () => {
      const sample = new Sample();

      const occurrence = new Occurrence({ attrs: { taxon: { group: 1 } } });
      sample.occurrences.push(occurrence);

      occurrence.getSurvey();
      expect(sampleGetSurveySpy.calledOnce).to.be.equal(true);
    });

    it('should throw an error if no parent sample', () => {
      const occurrence = new Occurrence({ attrs: { taxon: { group: 1 } } });
      expect(occurrence.getSurvey.bind(occurrence)).to.throw(
        'No parent exists to get survey'
      );
    });
  });
});
