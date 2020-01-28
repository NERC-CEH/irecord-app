import defaultSurveyConf from '../default';

describe('Default survey config', () => {
  describe('sample location', () => {
    it('should truncate lat long values to 7', () => {
      const location = {
        latitude: 50.869662311682666,
        longitude: '-0.000365611268033992', // test string
      };
      const parsedLocation = defaultSurveyConf.attrs.location.values(
        location,
        {
          fields: {},
        }
      );
      expect(parsedLocation).to.eql('50.8696623, -0.0003656');
    });
  });
});
