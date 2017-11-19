import { getFormId, forms } from '../general';
import dragonflies from '../general_dragonflies';

describe('Config', () => {
  describe('forms', () => {
    function formSpecTests(survey) {
      it('should have a taxon groups array', () => {
        expect(survey.taxonGroups).to.be.an('array');
      });
      it('should have a form', () => {
        expect(survey.editForm).to.be.an('array');
      });

      it('should have an id', () => {
        expect(survey.id).to.be.a('string');
      });
    }

    formSpecTests(dragonflies);
  });

  describe('general', () => {
    describe('getFormId', () => {
      it('should return a formId of a matching taxon group form', () => {
        const formId = 'x';
        const taxonGroups = [1];

        forms[formId] = { id: formId, taxonGroups };
        expect(getFormId(taxonGroups[0])).to.be.equal(formId);
      });
    });
  });
});
