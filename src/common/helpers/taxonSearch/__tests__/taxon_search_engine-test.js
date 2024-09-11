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
            'array_id',
            'species_id',
            'found_in_name',
            'warehouse_id',
            'group',
            'scientific_name',
            'common_names',
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
              result.common_names[0] === 'Willow' ||
              result.common_names[1] === 'Willow'
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

          expect(result.warehouse_id).toBe(229548);
          expect(result.scientific_name).toBe('Phytomyza ilicis');
        });

      const searchCommonName = () =>
        search('Giant Blackberry').then(results => {
          expect(Object.keys(results)).not.toHaveLength(0);
          const result = results[0];

          expect(result.warehouse_id).toBe(208098);
          expect(result.common_names[0]).toBe('Giant Blackberry');
          expect(result.scientific_name).toBe('Rubus armeniacus');
        });

      const searchGenus = () =>
        search('Rotaliella').then(results => {
          expect(Object.keys(results)).not.toHaveLength(0);
          const result = results[0];

          expect(result.warehouse_id).toBe(213771);
          expect(result.scientific_name).toBe('Rotaliella');
        });

      const searchSpecCase1 = () =>
        search('cockle').then(results => {
          expect(Object.keys(results)).not.toHaveLength(0);
          let found = false;
          results.forEach(species => {
            if (species.common_names[0] === 'Heart Cockle') {
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
            if (species.common_names[0] === 'Blackthorn') {
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
          res => res.scientific_name === 'Puffinus'
        );
        expect(containsPuffinus).toBeUndefined();
      }));

    it('should allow searching only scientific names', () =>
      search('puffin', { namesFilter: 'scientific' }).then(results => {
        const containsPuffinus = results.find(
          res => res.common_name === 'Tufted Puffin'
        );
        expect(containsPuffinus).toBeUndefined();
      }));

    it('should allow searching Recorder style (5 characters)', () =>
      search('pupuf').then(results => {
        const containsPuffinus = results.find(
          res => res.scientific_name === 'Puffinus puffinus'
        );
        expect(containsPuffinus).toBeInstanceOf(Object);
      }));

    describe('genus', () => {
      it('should add all species belonging to it', () =>
        search('Puffinus').then(results => {
          expect(results.length >= 6).toBe(true);
          const genus = results[0];
          expect(genus.warehouse_id).toBe(141974);
          expect(genus.scientific_name).toBe('Puffinus');

          const puffinusAsimilis = results[1];
          expect(puffinusAsimilis.warehouse_id).toBe(160697);
          expect(puffinusAsimilis.scientific_name).toBe('Puffinus assimilis');
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
