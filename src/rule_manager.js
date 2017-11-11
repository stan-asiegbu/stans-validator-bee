let Rule = require('./rule')

/**
 * RULE MANAGER
 */
let RuleManager = (function () {
  /**
   * The default rules to use.
   *                      1. required
   *                      2. maxLength
   *                      3. minLength
   *                      4. exactLength
   *                      5. numeric
   * @type {Array}
   */
  const defaultRules = [
    /*
    Required rule
     */
    new Rule("required", "{:field} is required", (value, idealValue) => {
      return !!value
    }),

    /**
     * Maximum Length rule
     */
    new Rule("maxLength", "{:field} should not exceed {:alias} characters",
      (value, idealValue) => {
        return value.length <= idealValue;
      }),

    new Rule("contains", "{:field} must contain {:alias}", (value, idealValue) => {
      return value.indexOf(idealValue) >= 0
    }),

    /**
     * Minimum Length rule
     */
    new Rule("minLength", "{:field} cannot be less than {:alias} characters", (value, idealValue) => {
      return value.length >= idealValue;
    }),

    /**
     * Exact Length rule
     */
    new Rule("exactLength", "{:field} must contain exactly {:alias} characters", (value, idealValue) => {
      return value.length === parseInt(idealValue);
    }),

    /**
     * Numeric rule
     */
    new Rule("numeric", "{:field} must be a valid number", (value, idealValue) => {
      return isNumeric(value);
    })
  ]

  function isNumeric(number) {
    // A Recursive approach
    if (number.length === 1) return !isNaN(parseInt(number))
    return !isNaN(parseInt(number[0])) && isNumeric(number.slice(1))
  }


  /**
   * Uses default rules if the parameter is empty
   * @param ruleSet
   * @constructor
   */
  function RuleManager(ruleSet) {
    let _definedRules = ruleSet || defaultRules;
    this.setDefinedRules(_definedRules);
  }

  /**
   * Returns the default rule objects
   * @returns {Array}
   */
  RuleManager.prototype.getDefaultRules = function() {
    return defaultRules;
  };


  /**
   * Returns the default rule object names
   * @returns {Array}
   */
  RuleManager.prototype.getDefaultRuleNames = function () {
    let names = [];
    defaultRules.forEach((rule) => {
      names.push(rule.name)
    })
    return names
  }


  /**
   * Sets the definedRules object
   * @param definedRules
   */
  RuleManager.prototype.setDefinedRules = function (definedRules) {
    if (!definedRules || !this.isValidRuleSet(definedRules)) {
      throw new Error("Argument should be an array of rules.")
    }
    this.definedRules = definedRules;
  };

  /**
   * Checks that all the contents of the ruleSet parameter are valid Rule instances
   * @param ruleSet
   * @returns {boolean}
   */
  RuleManager.prototype.isValidRuleSet = function(ruleSet) {
    ruleSet.forEach(rule => {
      if (!this.isValidRule(rule)) {
        return false;
      }
    });
    return true;
  };

  /**
   * Helper function that checks if an object is a valid Rule type
   * @param rule
   * @returns {boolean}
   */
  RuleManager.prototype.isValidRule = function (rule) {
    return rule instanceof Rule
  }


  /**
   * Add a new rule to the definedRules array
   * @param newRule {Rule}
   */
  RuleManager.prototype.addRule = function (newRule) {
    if (!this.isValidRule(newRule)) {
      throw new Error("The new rule must be an instance of `Rule`")
    }
    // add it to the start of the array so it serves like an overwrite of any previous rule
    // with the same name
    this.definedRules.push(newRule);
  }

  /**
   * Adds all the rules passed as an array to the definedRules array
   * @param ruleSet {Rule[]}
   */
  RuleManager.prototype.addRules = function (ruleSet) {
    if (!this.isValidRuleSet(ruleSet)) {
      throw new Error("The rule set must only contain instances of `Rule`")
    }
    ruleSet.forEach(rule => {
      this.definedRules.push(rule);
    });
  }

  /**
   * Returns an array containing name property of all the rules in definedRules array
   * @returns {Array}
   */
  RuleManager.prototype.getAllRuleNames = function () {
    let names = [];
    this.definedRules.forEach((rule) => names.push(rule.name));
    return names;
  };

  /**
   * Checks if a rule is registered in the definedRules object
   * @param ruleName
   * @returns {boolean}
   */
  RuleManager.prototype.ruleExists = function (ruleName) {
    return this.getAllRuleNames().Contains(ruleName)
  }

  /**
   * Returns all the rule objects from defined rules whose name is contained in the ruleNames parameter
   * @param ruleNames
   * @returns {Array}
   */
  RuleManager.prototype.getRulesByNames = function (ruleNames) {
    // check if all the assigned rules are registered with the rule manager
    ruleNames.forEach((ruleName) => {
      if (this.ruleExists(ruleName) === false) {
        throw new Error("The rule: " + ruleName + " is not registered with the rule manager");
      }
    });
    // return the rules
    let rules = [];
    this.definedRules.forEach((rule) => {
      if (ruleNames.Contains(rule.name)) {rules.push(rule)}
    });
    return rules;
  }

  /**
   * Checking if an array contains an element
   * @param element
   * @returns {boolean}
   */
  Array.prototype.Contains = function (element) {
    let found = false;
    this.forEach(elem => {
      if (elem === element) {found = true}
    });
    return found;
  }

  /**
   * Returns an array containing the values of an object
   * @param obj
   * @returns {Array}
   */
  Object.prototype.values = function (obj) {
    let _obj = obj || this
    let keys = Object.keys(_obj)
    let values = []
    keys.forEach((key) => values.push(_obj.key))
    return values
  }


  /**
   * Converts an object to an array
   * @param obj
   * @returns {Array}
   */
  Object.prototype.toArray = function (obj) {
    if (obj instanceof Array) return obj
    let _obj = obj || this
    let arr = []
    let keys = Object.keys(_obj)
    let values = Object.values(_obj)
    let index = 0;
    keys.forEach((key) => {
      arr[key] = values[index++]
    })
    return arr
  }

  return RuleManager;
}());

module.exports = RuleManager