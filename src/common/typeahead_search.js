/**
 * Returns a location name search function.
 */
import _ from 'lodash';

export default function (strs, max, strProcessor) {
  return function findMatches(q, cb) {
    // an array that will be populated with substring matches
    const matches = [];

    // regex used to determine if a string contains the substring `q`
    const substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    for (let length = strs.length, i = 0; i < length && matches.length < max; i++) {
      let str = strs[i];
      if (strProcessor) {
        str = strProcessor(strs[i]);
      }

      if (str && substrRegex.test(str)) {
        // check if not duplicate
        if (_.indexOf(matches, str) < 0) {
          matches.push(str);
        }
      }
    }

    cb(matches);
  };
}
