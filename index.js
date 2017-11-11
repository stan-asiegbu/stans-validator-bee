/**
 * This is the entry point for npm package and for webpack bundling
 */
let Validator = require('./src/validator')
let Rule = require('./src/rule')

module.exports = {
  Rule: Rule,
  Validator: Validator
}
module.exports.default = Validator