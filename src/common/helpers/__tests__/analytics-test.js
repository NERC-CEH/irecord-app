import Raven from 'raven-js';
import { removeUserId, breadcrumbCallback, dataCallback } from '../analytics';

// a = [
//   {
//     timestamp: 1518983843.872,
//     category: 'navigation',
//     data: { to: '/#info', from: '/#samples' },
//   },
//   {
//     timestamp: 1518983844.015,
//     category: 'ui.click',
//     message: 'div#left-panel.pull-left > a.icon.icon-left-nav',
//   },
//   {
//     timestamp: 1518983844.019,
//     message: 'Samples:List:Controller: showing 13.',
//     level: 'debug',
//     category: 'console',
//   },
//   {
//     timestamp: 1518983845.561,
//     category: 'ui.click',
//     message: 'li.table-view-cell.swipe > a.mobile > div.media-body > div.core',
//   },
//   {
//     timestamp: 1518983845.562,
//     category: 'navigation',
//     data: { to: '/#samples/UUID/edit', from: '/#samples' },
//   },
//   {
//     timestamp: 1518983850.738,
//     type: 'http',
//     category: 'xhr',
//     data: { url: 'https://www.brc.ac.uk/irecord/api/v1/samples' },
//   },
//   {
//     timestamp: 1518983935.123,
//     type: 'http',
//     category: 'xhr',
//     data: { url: 'https://www.brc.ac.uk/irecord/api/v1/users/USERID' },
//   },
//   {
//     timestamp: 1518983935.126,
//     message: 'Incorrect password or email.\n    ',
//     level: 'error',
//     category: 'console',
//   },
//
//   {
//     timestamp: 1518983844.015,
//     category: 'ui.click',
//     message: 'div#left-panel.pull-left > a.icon.icon-left-nav',
//   },
// ];
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
      const crumb = {
        timestamp: 1518983935.123,
        type: 'http',
        category: 'xhr',
        data: { url: 'https://www.brc.ac.uk/irecord/api/v1/users/ty%40uk2' },
      };

      const resultCrumb = breadcrumbCallback(crumb);

      expect(resultCrumb.data.url).to.equal(
        'https://www.brc.ac.uk/irecord/api/v1/users/USERID'
      );
    });

    it('should not save image GETs', () => {
      const crumb = {
        timestamp: 1518983969.273,
        type: 'http',
        category: 'xhr',
        data: {
          method: 'GET',
          url: 'file:///data/user/0/uk.ac.ceh.irecord/files/1471447312788.jpeg',
        },
      };
      const resultCrumb = breadcrumbCallback(crumb);
      expect(resultCrumb.data.url).to.be.eql(
        'file:///data/user/0/uk.ac.ceh.irecord/files/FILENAME.jpeg'
      );
    });
  });

  describe('dataCallback', () => {
    it('should cap the breadcrumbs to max 100', () => {
      const values = new Array(102).fill({});
      const processed = dataCallback({ breadcrumbs: { values } });
      expect(processed.breadcrumbs.values.length).to.be.equal(100);
    });

    it('should cap the breadcrumbs to last 100', () => {
      const values = new Array(102).fill({});
      values.push('a');
      const processed = dataCallback({ breadcrumbs: { values } });
      expect(processed.breadcrumbs.values[99]).to.be.equal('a');
    });

    it('should concat same xhr request crumbs', () => {
      const values = [
        {
          timestamp: 1518983845.561,
          category: 'ui.click',
          message:
            'li.table-view-cell.swipe > a.mobile > div.media-body > div.core',
        },
        {
          timestamp: 1518983969.273,
          type: 'http',
          category: 'xhr',
          data: {
            method: 'GET',
            url:
              'file:///data/user/0/uk.ac.ceh.irecord/files/1471447312788.jpeg',
          },
        },
        {
          timestamp: 1518983971.273,
          type: 'http',
          category: 'xhr',
          data: {
            method: 'GET',
            url:
              'file:///data/user/0/uk.ac.ceh.irecord/files/1471447312789.jpeg',
          },
        },
        {
          timestamp: 1518983845.562,
          category: 'navigation',
          data: { to: '/#samples/UUID/edit', from: '/#samples' },
        },
      ];
      const processed = dataCallback({ breadcrumbs: { values } });
      expect(processed.breadcrumbs.values.length).to.be.equal(3);
      expect(processed.breadcrumbs.values[1].data.url.includes('_x2')).to.be
        .true;
    });

    it('should remove UUID from culprit', () => {
      const culprit = 'F7F5C5C0-44ED-46F9-B8E1-8694F58E9B42';
      const processed = dataCallback({
        culprit,
        breadcrumbs: { values: new Array(102) },
      });
      expect(processed.culprit).to.be.equal('UUID');
    });

    it('should remove UUID from request url', () => {
      const url = 'F7F5C5C0-44ED-46F9-B8E1-8694F58E9B42';
      const processed = dataCallback({
        request: { url },
        breadcrumbs: { values: new Array(102) },
      });
      expect(processed.request.url).to.be.equal('UUID');
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
