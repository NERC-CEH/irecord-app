require('dotenv').config({ silent: true }); // get local environment variables from .env

/**
 * Eslint-tests all source and test files.
 */
const glob = require('glob'); //eslint-disable-line
const CLIEngine = require('eslint').CLIEngine;
const assert = require('chai').assert;

const paths = glob.sync('./+(src|test)/**/*.js');
const engine = new CLIEngine({
  envs: ['node', 'mocha'],
  useEslintrc: true,
});

const results = engine.executeOnFiles(paths).results;

function formatMessages(messages) {
  const errors = messages.map(
    err =>
      `${err.line}:${err.column} ${err.message.slice(0, -1)} - ${err.ruleId}\n`
  );
  return `\n${errors.join('')}`;
}

const errorsFilter = err =>
  !err.message.includes('File ignored because of a matching ignore pattern');

function generateTest(result) {
  const { filePath, messages } = result;

  it(`validates ${filePath}`, () => {
    const filteredErrors = messages.filter(errorsFilter);
    if (filteredErrors.length > 0) {
      assert.fail(false, true, formatMessages(filteredErrors));
    }
  });
}

describe('ESLint', () => {
  results.forEach(result => generateTest(result));
});
