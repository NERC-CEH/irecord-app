import Morel from 'morel';
import recordManger from '../record_manager';
import Sample from '../sample';
import DateHelp from 'helpers/date';

describe('Sample', () => {
  it('should have current date by default', () => {
      const sample = new Sample();
      const date = sample.get('date');

      expect(DateHelp.print(date)).to.be.equal(DateHelp.print(new Date()));
  });
});
