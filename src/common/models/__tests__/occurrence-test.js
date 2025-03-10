/* eslint-disable no-unused-expressions */
import sinon from 'sinon';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';

describe('Occurrence', () => {
  it.skip('should validate', () => {
    const occurrence = new Occurrence();
    expect(occurrence.validate).toBeInstanceOf(Function);
    occurrence.clear();

    const invalids = occurrence.validate(null, { remote: true });
    expect(invalids.attributes).to.be.an('object').toHaveProperty('taxon');
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
      expect(occurrence.getSurvey).toBeInstanceOf(Function);
    });

    it('should call parent getSurvey', () => {
      const sample = new Sample();

      const occurrence = new Occurrence({ data: { taxon: { group: 1 } } });
      sample.occurrences.push(occurrence);

      occurrence.getSurvey();
      expect(sampleGetSurveySpy.toBeCalledTimes(1)).toBe(true);
    });

    it('should throw an error if no parent sample', () => {
      const occurrence = new Occurrence({ data: { taxon: { group: 1 } } });
      expect(occurrence.getSurvey.bind(occurrence)).toThrow(
        'No parent exists to get survey'
      );
    });
  });
});
