/**
 * Eslint-tests all source and test files.
 */
const glob = require('glob'); // eslint-disable-line
const { CLIEngine } = require('eslint');
const { assert } = require('chai');

const paths = glob.sync('./+(src|test)/**/*.js');
const engine = new CLIEngine({
  envs: ['node', 'mocha'],
  useEslintrc: true,
});

const { results } = engine.executeOnFiles(paths);

const onlyErrors = message => message.severity > 1;

function formatMessages(messages) {
  const errors = messages.filter(onlyErrors).map(message => {
    return `${message.line}:${message.column} ${message.message.slice(
      0,
      -1
    )} - ${message.ruleId}\n`;
  });

  return `\n${errors.join('')}`;
}

function generateTest(result) {
  const { filePath, messages } = result;

  it(`validates ${filePath}`, function() {
    const hasErrors = messages.find(onlyErrors);
    if (messages.length > 0 && hasErrors) {
      assert.fail(false, true, formatMessages(messages));
    }
  });
}

describe('ESLint', function() {
  results.forEach(result => generateTest(result));
});
