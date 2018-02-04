import Raven from 'raven-js';
import API, { removeUserId, breadcrumbCallback } from '../analytics';

describe('Helpers Analytics', () => {
  let RavenStub;
  before(() => {
    RavenStub = sinon.stub(Raven, 'config');
    RavenStub.returns({ install() {} });
  });
  after(() => {
    RavenStub.restore();
  });

  describe('breadcrumbCallback', () => {
    it('should remove userId from ajax URLs', () => {
      API.init();
      const crumb = {
        category: 'xhr',
        data: { url: 'https://www.brc.ac.uk/irecord/api/v1/users/ty%40uk2' },
      };
      const resultCrumb = breadcrumbCallback(crumb);

      expect(resultCrumb.data.url).to.equal(
        'https://www.brc.ac.uk/irecord/api/v1/users/USERID'
      );
    });
  });

  describe('removeUserId', () => {
    it('should remove user id from the URL', () => {
      const URL = 'https://www.brc.ac.uk/irecord/api/v1/users/ty%40uk2';
      expect(removeUserId(URL)).to.equal(
        'https://www.brc.ac.uk/irecord/api/v1/users/USERID'
      );
    });
  });
});
