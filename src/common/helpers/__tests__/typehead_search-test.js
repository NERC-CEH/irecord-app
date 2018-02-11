import searchFnGenerator from '../typeahead_search';

describe('Typehead search', () => {
  it('should generate a function', () => {
    expect(searchFnGenerator()).to.be.a('function');
  });

  it('should find values in suggestions', done => {
    const search = searchFnGenerator(['test', 'test2', 'else']);
    search('test', results => {
      expect(results.length).to.be.equal(2);
      done();
    });
  });

  it('should escape', done => {
    const search = searchFnGenerator(['test)(*&$', 'test2', 'else']);
    search('test)(*&$', results => {
      expect(results.length).to.be.equal(1);
      done();
    });
  });
});
