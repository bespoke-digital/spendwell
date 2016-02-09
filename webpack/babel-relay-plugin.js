/*eslint no-var: 0*/

var babelRelayPlugin = require('babel-relay-plugin');
var childProcess = require('child_process');

childProcess.execSync('./manage.py export_schema');

var schema = require('../spendwell/schema.json');

module.exports = babelRelayPlugin(schema);
