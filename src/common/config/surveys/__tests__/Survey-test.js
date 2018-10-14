import generalSurveys from 'common/config/surveys/general/index';
import Survey from '../Survey';

describe('Survey', () => {
  it('should be a function', () => {
    expect(Survey).to.be.a('function');
  });

  it('should set an id', () => {
    expect(new Survey({ id: 1 }).id).to.be.equal(1);
  });
  it('should set a name', () => {
    expect(new Survey({ name: 'name' }).name).to.be.equal('name');
  });
  it('should set complex', () => {
    expect(new Survey({ complex: true }).complex).to.be.equal(true);
  });
  it('should set taxonGroups', () => {
    expect(new Survey({ taxonGroups: [] }).taxonGroups).to.be.eql([]);
  });
  it('should set attrs', () => {
    const attrs = { occ: 1, smp: 2 };
    expect(new Survey({ attrs }).attrs).to.be.equal(attrs);
  });

  it('should have verify method', done => {
    new Survey({ verify: done }).verify();
  });

  describe('existing general surveys', () => {
    function surveySpecTests(survey) {
      describe(survey.name, () => {
        it('should have a name', () => {
          expect(survey.name).to.be.a('string');
        });

        it('should have a taxon groups array', () => {
          expect(survey.taxonGroups).to.be.an('array');
        });
        it('should have a an attributes config', () => {
          expect(survey.attrs)
            .to.be.an('object')
            .that.has.all.keys('occ', 'smp');
        });
      });
    }
    Object.keys(generalSurveys).forEach(surveyKey => {
      surveySpecTests(generalSurveys[surveyKey]);
    });
  });

  describe('factory', () => {
    it('should return a Survey instance', () => {
      const survey = Survey.factory();
      expect(survey).to.be.instanceOf(Survey);
    });

    it('should return complex', () => {
      expect(Survey.factory(null, true).complex).to.be.equal(true);
    });

    it('should return general default if no taxon group passed', () => {
      const survey = Survey.factory();
      expect(survey.complex).to.be.equal(undefined);
      expect(survey.name).to.equal('default');
    });

    it('should merge general default with matching survey', () => {
      const dragonfliesGroupId = 107;
      const survey = Survey.factory(dragonfliesGroupId);
      expect(survey.name).to.equal('dragonflies');
      expect(survey.verify).to.be.a('function');
      expect(survey.attrs.occ.adCount).to.be.an('object');
      expect(survey.attrs.occ.number).to.be.an('object');
    });

    it('should overwrite rather than merge attribute definitions', () => {
      const buterfliesGroupId = 104;
      const butterflyRanges = {
        '1': 2402,
        '2-9': 2404,
        '10-29': 2406,
        '30-99': 2408,
        '100+': 2410
      };

      const survey = Survey.factory(buterfliesGroupId);
      // overwritten
      expect(survey.attrs.occ['number-ranges'].values).to.eql(butterflyRanges);
      
      // same as general
      expect(survey.attrs.occ.number).to.be.an('object');
    });
  });
});
