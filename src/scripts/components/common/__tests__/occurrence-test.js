import Morel from 'morel';
import recordManger from '../record_manager';
import Sample from '../sample';
import dateHelp from 'helpers/date';

describe('Sample', () => {
  it('should have current date by default', () => {
      const sample = new Sample();
      const date = sample.get('date');

      expect(dateHelp.print(date)).to.be.equal(dateHelp.print(new Date()));
  });
});
