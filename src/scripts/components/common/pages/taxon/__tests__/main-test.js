import searchEngine from '../taxon_search_engine';

describe('Taxon Search Engine', () => {
  it('should be an API object with search function', () => {
    expect(searchEngine).to.be.an('object');
    expect(searchEngine.search).to.exist;
    expect(searchEngine.search).to.be.a('function');
  });

  describe('search function', () => {
    it('should accept a string and a callback', (done) => {
      searchEngine.search('blackbird', (results) => {
        done();
      });
    });

    it('should accept both capitalized and lowercase strings', (done) => {
      searchEngine.search('blackbird', (results) => {
        searchEngine.search('Blackbird', (results2) => {
          expect(results).to.deep.equal(results2);
          done();
        });
      });
    });

    describe('return', () => {
      it('should be an array', (done) => {
        searchEngine.search('blackbird', (results) => {
          expect(results).to.be.an('array');
          expect(results.length).to.equal(1);
          done();
        });
      });
      it('should hold warehouse_id', (done) => {
        searchEngine.search('blackbird', (results) => {
          const result = results[0];

          expect(result).to.be.an('object');
          expect(result).to.have.all.keys(
            'array_id',
            'species_id',
            'found_in_name',
            'warehouse_id',
            'group',
            'scientific_name',
            'common_name',
            'synonym'
          );
          done();
        });
      });
      it('should be correct values against warehouse csv', (done) => {
        searchEngine.search('Phytomyza ilicis', (results) => {
          expect(results).to.not.be.empty;
          const result = results[0];

          expect(result.warehouse_id).to.be.equal(229548);
          expect(result.scientific_name).to.be.equal('Phytomyza ilicis');

          // genus
          searchEngine.search('Rotaliella', (results) => {
            expect(results).to.not.be.empty;
            const result = results[0];

            expect(result.warehouse_id).to.be.equal(213771);
            expect(result.scientific_name).to.be.equal('Rotaliella');

            // common name
            searchEngine.search('Giant Blackberry', (results) => {
              expect(results).to.not.be.empty;
              const result = results[0];

              expect(result.warehouse_id).to.be.equal(208098);
              expect(result.common_name).to.be.equal('Giant Blackberry');
              expect(result.scientific_name).to.be.equal('Rubus armeniacus');

              done();
            });
          });
        });
      });
    });
  });
});

