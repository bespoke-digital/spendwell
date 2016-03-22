/*eslint no-var: 0*/

var babelRelayPlugin = require('babel-relay-plugin');
var childProcess = require('child_process');
var path = require('path');

var schema = JSON.parse(childProcess.execSync(
  'python ' + path.resolve('./manage.py') + ' export_schema'
));

module.exports = babelRelayPlugin(schema);
