/**
 * Returns a location name search function.
 */
import _ from 'lodash';
import appModel from 'app_model';

function substringMatcher(strs, max) {
  return function findMatches(q, cb) {
    // an array that will be populated with substring matches
    const matches = [];

    // regex used to determine if a string contains the substring `q`
    const substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    for (let length = strs.length, i = 0; i < length && matches.length < max; i++) {
      const str = strs[i];
      if (str.name && substrRegex.test(str.name)) {
        // check if not duplicate
        if (_.indexOf(matches, str.name) < 0) {
          matches.push(str.name);
        }
      }
    }

    cb(matches);
  };
}

export default (max) => {
  const previousLocations = appModel.get('locations');
  return substringMatcher(previousLocations, max);
};
