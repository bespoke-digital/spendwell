/*eslint no-var: 0*/

var relayPlugin = require('babel-relay-plugin');
var relaySchema = require('../spendwell/schema.json');

module.exports = relayPlugin(relaySchema);
