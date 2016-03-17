/*eslint no-var: 0*/

var babelRelayPlugin = require('babel-relay-plugin');
var childProcess = require('child_process');
var path = require('path');

childProcess.execSync(path.normalize('./manage.py') + ' export_schema');

var schema = require('../spendwell/schema.json');

module.exports = babelRelayPlugin(schema);
