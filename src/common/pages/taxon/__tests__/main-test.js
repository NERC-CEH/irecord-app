import 'species.data';
import searchEngine from '../search/taxon_search_engine';

/* eslint-disable no-unused-expressions */

const NAME = 1;
const WAREHOUSE_ID = 0;

/**
 * Gets a random species from the species list
 * @returns {Array}
 */
// eslint-disable-next-line
function getRandomSpecies() {
  let randArrayIndex = (
    Math.random() *
    (window.species_list.length - 1)
  ).toFixed(0);
  const sp = window.species_list[randArrayIndex];
  let species = [];
  let speciesArray;
  for (let j = 0, length = sp.length; j < length; j++) {
    if (sp[j] instanceof Array) {
      speciesArray = sp[j];
    }
  }
  if (speciesArray) {
    randArrayIndex = (Math.random() * (speciesArray.length - 1)).toFixed(0);
    const speciesInArray = speciesArray[randArrayIndex];
    species = [
      speciesInArray[WAREHOUSE_ID],
      `${sp[2]} ${speciesInArray[NAME]}`,
    ];
  } else {
    species = [sp[WAREHOUSE_ID], sp[2]];
  }

  return species;
}

describe('Taxon Search Engine', () => {
  before(done => {
    // todo: remove this as the engine should work without it!
    searchEngine.init().then(done);
  });

  it('should be an API object with search function', () => {
    expect(searchEngine).to.be.an('object');
    expect(searchEngine.search).to.exist;
    expect(searchEngine.search).to.be.a('function');
  });

  describe('search', () => {
    it('should accept a string and a callback', done => {
      searchEngine.search('blackbird').then(() => {
        done();
      });
    });

    it('should accept both capitalized and lowercase strings', done => {
      searchEngine.search('blackbird').then(results => {
        searchEngine.search('Blackbird').then(results2 => {
          expect(results).to.deep.equal(results2);
          done();
        });
      });
    });

    describe('common names', () => {
      it('should look into middle names', done => {
        searchEngine.search('woodpecker').then(results => {
          expect(results).to.be.an('array');
          expect(results.length > 0).to.be.true;
          done();
        });
      });
    });

    it('should treat non alpha numeric characters as spaces', done => {
      // todo: check "Wakely's Dowd"
      searchEngine.search('Isle-of-Man Cabbage').then(results => {
        searchEngine.search('Isle of Man Cabbage').then(resultsDash => {
          expect(results).to.deep.equal(resultsDash);

          searchEngine
            .search('Perfoliate (Cotswold) Pennycress')
            // eslint-disable-next-line
            .then(results => {
              searchEngine
                .search('Perfoliate Cotswold Pennycress')
                .then(resultsBracket => {
                  expect(results).to.deep.equal(resultsBracket);
                  done();
                });
            });
        });
      });
    });
    it('should accept hybrids', done => {
      searchEngine.search('Caryopteris incana x mongholica =').then(results => {
        expect(results).to.be.an('array');
        expect(results.length).to.equal(1);

        // eslint-disable-next-line
        searchEngine.search('X Cupressocyparis').then(results => {
          expect(results).to.be.an('array');
          expect(results.length).to.equal(1);
          done();
        });
      });
    });

    it('should find genus common names', done => {
      searchEngine.search('Willow').then(results => {
        expect(results).to.be.an('array');
        let found = false;
        results.forEach(result => {
          if (result.common_name === 'Willow' || result.synonym === 'Willow') {
            found = true;
          }
        });
        expect(found).to.be.true;
        // eslint-disable-next-line
        searchEngine.search('Jumping spiders').then(results => {
          expect(results).to.be.an('array');
          expect(results.length).to.equal(1);
          done();
        });
      });
    });

    describe('genus', () => {
      it('should add all species belonging to it', done => {
        searchEngine.search('Puffinus').then(results => {
          expect(results.length).to.be.equal(9);
          const genus = results[0];
          expect(genus.warehouse_id).to.be.equal(141974);
          expect(genus.scientific_name).to.be.equal('Puffinus');

          const puffinusAsimilis = results[1];
          expect(puffinusAsimilis.warehouse_id).to.be.equal(160697);
          expect(puffinusAsimilis.scientific_name).to.be.equal(
            'Puffinus assimilis'
          );
          done();
        });
      });
    });

    // const SEARCH_TIMES = 10000;
    // describe(`random taxa search ${SEARCH_TIMES}`).then(() => {
    //  // random search of 100 names
    //  const speciesToSearch = [];
    //  for (let i = 0; i < SEARCH_TIMES; i++) {
    //    speciesToSearch.push(getRandomSpecies());
    //  }
    //
    //  // go through selected species names
    //  speciesToSearch.forEach(function(species) {
    //    it(`should find ${species[NAME]} (${species[WAREHOUSE_ID]})`, (done) => {
    //      searchEngine.search(species[NAME]).then((results) => {
    //        expect(results).to.not.be.empty;
    //
    //        //check all results
    //        let found = false;
    //        results.forEach((result) => {
    //          if (result.warehouse_id === species[WAREHOUSE_ID]) {
    //            found = true;
    //          }
    //        });
    //
    //        expect(found).to.be.true;
    //        done();
    //      });
    //    });
    //  });
    // });

    it('should work with selected taxa', done => {
      searchEngine.search('Phytomyza ilicis').then(results => {
        expect(results).to.not.be.empty;
        const result = results[0];

        expect(result.warehouse_id).to.be.equal(229548);
        expect(result.scientific_name).to.be.equal('Phytomyza ilicis');

        // genus
        // eslint-disable-next-line
        searchEngine.search('Rotaliella').then(results => {
          expect(results).to.not.be.empty;
          // eslint-disable-next-line
          const result = results[0];

          expect(result.warehouse_id).to.be.equal(213771);
          expect(result.scientific_name).to.be.equal('Rotaliella');

          // common name
          // eslint-disable-next-line
          searchEngine.search('Giant Blackberry').then(results => {
            expect(results).to.not.be.empty;
            // eslint-disable-next-line
            const result = results[0];

            expect(result.warehouse_id).to.be.equal(208098);
            expect(result.common_name).to.be.equal('Giant Blackberry');
            expect(result.scientific_name).to.be.equal('Rubus armeniacus');

            // specific cases
                          // eslint-disable-next-line
            searchEngine.search('cockle').then(results => {
              expect(results).to.not.be.empty;
              let found = false;
              results.forEach(species => {
                if (species.common_name === 'Heart Cockle') {
                  found = true;
                }
              });
              expect(found).to.be.true;

              // eslint-disable-next-line
              searchEngine.search('blackthorn').then(results => {
                expect(results).to.not.be.empty;
                // eslint-disable-next-line
                let found = false;
                results.forEach(species => {
                  if (species.common_name === 'Blackthorn') {
                    found = true;
                  }
                });
                expect(found).to.be.true;
                done();
              });
            });
          });
        });
      });
    });

    describe('return', () => {
      it('should be an array', done => {
        searchEngine.search('blackbird').then(results => {
          expect(results).to.be.an('array');
          expect(results.length).to.equal(8);
          done();
        });
      });
      it('should hold warehouse_id', done => {
        searchEngine.search('blackbird').then(results => {
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
    });
  });
});
