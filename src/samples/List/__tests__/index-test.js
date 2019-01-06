import { sampleDelete, setTaxon } from '../components/Sample';

// eslint-disable-next-line
describe('List Controller', function() {
  // it can take time to add/remove samples
  this.timeout(10000);

  it('should have a sampleDelete method', () => {
    expect(sampleDelete).to.be.a('function');
  });

  it('should have a setTaxon method ', () => {
    expect(setTaxon).to.be.a('function');
  });
});
