import search from '..';

describe('Taxon Search Engine', () => {
  describe('search', () => {
    it('should return a Promise', () => {
      const promise = search('blackbird');
      expect(promise).toBeInstanceOf(Promise);
      return promise;
    });

    it('should resolve to an array', () =>
      search('blackbird').then(results => {
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBe(8);
      }));

    it('should include full species description', () =>
      search('blackbird').then(results => {
        const result = results[0];

        expect(result).toBeInstanceOf(Object);
        expect(Object.keys(result)).toEqual(
          expect.arrayContaining([
            'arrayId',
            'speciesId',
            'foundInName',
            'warehouseId',
            'group',
            'scientificName',
            'commonNames',
          ])
        );
      }));

    it('should accept both capitalized and lowercase strings', () =>
      search('blackbird').then(results =>
        search('Blackbird').then(results2 => expect(results).toEqual(results2))
      ));

    // TODO: fix
    it.skip('should treat non alpha numeric characters as spaces', () => {
      // TODO: check "Wakely's Dowd"
      const searchNonAlpha1 = () =>
        search('Isle-of-Man Cabbage').then(results =>
          search
            .search('Isle of Man Cabbage')
            .then(resultsDash => expect(results).toEqual(resultsDash))
        );

      const searchNonAlpha2 = () =>
        search('Perfoliate (Cotswold) Pennycress').then(results =>
          search
            .search('Perfoliate Cotswold Pennycress')
            .then(resultsBracket => expect(results).toEqual(resultsBracket))
        );

      return searchNonAlpha1().then(searchNonAlpha2);
    });

    it('should accept hybrids', async () => {
      const results = await search('Caryopteris incana x mongholica =');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(1);

      const cupressocyparisResults = await search('X Cupressocyparis');
      expect(Array.isArray(cupressocyparisResults)).toBe(true);
      expect(cupressocyparisResults.length).toBe(1);
    });

    it('should find genus common names', () =>
      search('Willow')
        .then(results => {
          expect(Array.isArray(results)).toBe(true);
          let found = false;
          results.forEach(result => {
            if (
              result.commonNames[0] === 'Willow' ||
              result.commonNames[1] === 'Willow'
            ) {
              found = true;
            }
          });
          expect(found).toBe(true);
        })
        .then(() =>
          search('Jumping spiders').then(spidersResults => {
            expect(Array.isArray(spidersResults)).toBe(true);
            expect(spidersResults.length).toBe(1);
          })
        ));

    it('should work with selected taxa', () => {
      const searchLatin = () =>
        search('Phytomyza ilicis').then(results => {
          expect(Object.keys(results)).not.toHaveLength(0);
          const result = results[0];

          expect(result.warehouseId).toBe(229548);
          expect(result.scientificName).toBe('Phytomyza ilicis');
        });

      const searchCommonName = () =>
        search('Giant Blackberry').then(results => {
          expect(Object.keys(results)).not.toHaveLength(0);
          const result = results[0];

          expect(result.warehouseId).toBe(208098);
          expect(result.commonNames[0]).toBe('Giant Blackberry');
          expect(result.scientificName).toBe('Rubus armeniacus');
        });

      const searchGenus = () =>
        search('Rotaliella').then(results => {
          expect(Object.keys(results)).not.toHaveLength(0);
          const result = results[0];

          expect(result.warehouseId).toBe(213771);
          expect(result.scientificName).toBe('Rotaliella');
        });

      const searchSpecCase1 = () =>
        search('cockle').then(results => {
          expect(Object.keys(results)).not.toHaveLength(0);
          let found = false;
          results.forEach(species => {
            if (species.commonNames[0] === 'Heart Cockle') {
              found = true;
            }
          });
          expect(found).toBe(true);
        });

      const searchSpecCase2 = () =>
        search('blackthorn').then(results => {
          expect(Object.keys(results)).not.toHaveLength(0);
          // eslint-disable-next-line
          let found = false;
          results.forEach(species => {
            if (species.commonNames[0] === 'Blackthorn') {
              found = true;
            }
          });
          expect(found).toBe(true);
        });

      return searchLatin()
        .then(searchCommonName)
        .then(searchGenus)
        .then(searchSpecCase1)
        .then(searchSpecCase2);
    });

    it('should allow searching only common names', () =>
      search('puffin', { namesFilter: 'common' }).then(results => {
        const containsPuffinus = results.find(
          res => res.scientificName === 'Puffinus'
        );
        expect(containsPuffinus).toBeUndefined();
      }));

    it('should allow searching only scientific names', () =>
      search('puffin', { namesFilter: 'scientific' }).then(results => {
        const containsPuffinus = results.find(
          res => res.commonName === 'Tufted Puffin'
        );
        expect(containsPuffinus).toBeUndefined();
      }));

    it('should allow searching Recorder style (5 characters)', () =>
      search('pupuf').then(results => {
        const containsPuffinus = results.find(
          res => res.scientificName === 'Puffinus puffinus'
        );
        expect(containsPuffinus).toBeInstanceOf(Object);
      }));

    describe('genus', () => {
      it('should add all species belonging to it', () =>
        search('Puffinus').then(results => {
          expect(results.length >= 6).toBe(true);
          const genus = results[0];
          expect(genus.warehouseId).toBe(141974);
          expect(genus.scientificName).toBe('Puffinus');

          const puffinusAsimilis = results[1];
          expect(puffinusAsimilis.warehouseId).toBe(160697);
          expect(puffinusAsimilis.scientificName).toBe('Puffinus assimilis');
        }));
    });

    describe('common names', () => {
      it('should look into middle names', () =>
        search('woodpecker').then(results => {
          expect(Array.isArray(results)).toBe(true);
          expect(results.length > 0).toBe(true);
        }));
    });
  });
});
