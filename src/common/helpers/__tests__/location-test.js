import LocHelp from '../location';

describe('Location', () => {
  it('it should have gridref accurracies', () => {
    expect(LocHelp.gridref_accuracy).to.be.an('object');
  });
});
