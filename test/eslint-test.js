/**
 * Eslint-tests all source and test files.
 */
const glob = require('glob'); // eslint-disable-line
const CLIEngine = require('eslint').CLIEngine;
const assert = require('chai').assert;

const paths = glob.sync('./+(src|test)/**/*.js');
const engine = new CLIEngine({
  envs: ['node', 'mocha'],
  useEslintrc: true,
});

const results = engine.executeOnFiles(paths).results;

describe('ESLint', function() {
  results.forEach(result => generateTest(result));
});

const onlyErrors = message => message.severity > 1;

function generateTest(result) {
  const { filePath, messages } = result;

  it(`validates ${filePath}`, function() {
    const hasErrors = messages.find(onlyErrors);
    if (messages.length > 0 && hasErrors) {
      assert.fail(false, true, formatMessages(messages));
    }
  });
}

function formatMessages(messages) {
  const errors = messages.filter(onlyErrors).map(message => {
    return `${message.line}:${message.column} ${message.message.slice(0, -1)} - ${
      message.ruleId
    }\n`;
  });

  return `\n${errors.join('')}`;
}
