import { removeUserId, beforeBreadcrumb } from '../analytics';

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
  describe('beforeBreadcrumb', () => {
    it('should not save image GETs', () => {
      const crumb = {
        timestamp: 1518983969.273,
        type: 'http',
        category: 'xhr',
        data: {
          method: 'GET',
          url: 'file:///data/user/0/uk.org.orks.app/files/1471447312788.jpeg',
        },
      };
      const resultCrumb = beforeBreadcrumb(crumb);
      expect(resultCrumb.data.url).to.be.eql(
        'file:///data/user/0/uk.org.orks.app/files/FILENAME.jpeg'
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
