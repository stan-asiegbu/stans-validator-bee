(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * RULE
 * @author Asiegbu Stanley C
 * @desc Describes the structure of a validation rule
 */
var Rule = function () {
  /**
   *
   * @param name
   * @param msg
   * @param passCriteria
   * @constructor
   */
  function Rule(name, msg, passCriteria) {
    this.name = name;
    this.errMsg = msg;
    this.passCriteria = passCriteria;
  }

  /**
   *
   * @param value
   * @param idealValue
   * @param idealValueAlias Optional
   * @returns {*}
   */
  Rule.prototype.check = function (value, idealValue) {
    var idealValueAlias = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    if (this.passCriteria(value, idealValue)) {
      return { status: true, msg: null, idealValue: idealValue };
    }
    var msg = this.errMsg.replace("{:alias}", idealValueAlias);
    return {
      status: false,
      msg: msg,
      idealValue: idealValue
    };
  };

  return Rule;
}();

module.exports = Rule;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * This is the entry point for npm package and for webpack bundling
 */
var Validator = __webpack_require__(2);
var Rule = __webpack_require__(0);

module.exports = {
  Rule: Rule,
  Validator: Validator
};
module.exports.default = Validator;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var RuleManager = __webpack_require__(3);

/**
 * STAN'S FORM VALIDATOR
 * @author Asiegbu Stanley C
 * Date: 31st October, 2017
 *
 * @desc
 * It is the actual form data validator
 */
var Validator = function () {
  /**
   *
   * @param formId
   * @param formData
   * @constructor
   */
  function Validator(formId, formData) {
    /**
     * Contains the elements that did not pass the rules registered on them
     * All the rules failed by an element is contained here
     * @type {Array}
     */
    this.problemElems = [];

    /**
     * Contains the elements that did not pass the rules registered on them
     * Only the first rules failed by an element is contained here
     * @type {Array}
     */
    this.firstErrors = [];

    /**
     * Determines whether to return only the first errors encountered for each field after validation
     * If set to false, validate function returns all problem elements array to the promise
     * @type {boolean}
     */
    this.useFirstErrors = false;

    /**
     * The Id of the container element that contains the form fields
     * @type string
     */
    this.targetId = formId;

    /**
     * The form data to be validated
     */
    this.formData = formData;

    /**
     * Names of all the fields registered to be validated
     * @type {Array}
     */
    this.registeredFields = [];

    /**
     * This is the private rule manager object
     * It manages all actions related to rules like adding a custom rule.
     * The validator class acts as an interface to it
     * @type {RuleManager}
     */
    this.rm = new RuleManager();
    // return an instance of the class
  }

  /**
   * Sets the container element for the form fields. It is preferred to give it the id of the form itself
   * but any id can serve provided all the form fields registered to be validated are children of the element
   * with the id
   * IT MUST BE A VALID ID
   * @param formId
   * @returns {Validator}
   */
  Validator.prototype.target = function (formId) {
    this.targetId = formId;
    return this;
  };

  /**
   * Sets the rules to validate the form against
   * @param rules
   * @returns {Validator}
   */
  Validator.prototype.use = function (rules) {
    this.rules = rules;
    return this;
  };

  /**
   * sets the form data to be validated
   * @param formData
   * @returns {Validator}
   */
  Validator.prototype.setData = function (formData) {
    this.formData = formData;
    return this;
  };

  /**
   * builds up the form data
   * @param formId
   */
  Validator.prototype.buildFormData = function (formId) {
    // get all fields registered for validation
    var fields = this.getRegisteredFieldNames(this.rules);

    // set the property
    this.registeredFields = fields;

    // create object
    var formData = {};
    fields.forEach(function (field) {
      // get field value
      formData[field] = document.querySelector('#' + formId + " *[name='" + field + "']");
    });
    this.formData = formData;
  };

  /**
   * Returns the name of all registered fields from field validation registration array
   * @param registeredFields
   * @returns {Array}
   */
  Validator.prototype.getRegisteredFieldNames = function (registeredFields) {
    return Object.keys(registeredFields);
  };

  /**
   * This is where the actual validation algorithm takes place
   * @returns {ValidatorPromise}
   */
  Validator.prototype.validate = function () {
    var _this2 = this;

    var _this = this;
    this.buildFormData(this.targetId);

    // Check if the validator object passes all criteria before validating
    if (this.formData === null) throw new Error('The `data` cannot be null');
    if (this.targetId === '') throw new Error('The `targetId` property cannot be null');
    if (this.rules === null) throw new Error('The `rules` property cannot be null');

    // Get all the form fields that were registered for validation
    // Unregistered fields will be ignored
    var fields = this.registeredFields;
    fields.forEach(function (field) {
      // Get the DOM object for the field
      var elem = document.querySelectorAll("*[name='" + field + "']")[0];
      var elemValue = elem.value;

      var feedback = _this2.check(field, elemValue);
      if (feedback.status === false) {
        // The field did not pass the test so add it to the problem elements array
        var tagName = document.getElementsByName(field)[0].tagName;
        var selector = '#' + _this.targetId + ' ' + tagName + "[name='" + field + "']";

        feedback.allErrors.forEach(function (error) {
          var errorFeedback = {
            selector: selector,
            msg: error.msg.replace('{:field}', field)

            // add the new feedback to the problem elements array
          };_this2.problemElems.unshift(errorFeedback);

          // check if this field already has an error in the first errors array
          // if it does not have, add this error to the array
          if (!exists_in_array(_this2.firstErrors, function (err) {
            return err.selector === selector;
          })) {
            _this2.firstErrors.push(errorFeedback);
          }
        });
      }
    });
    // return a promise that will execute success and failure callbacks that are passed to it
    return this.useFirstErrors ? new ValidatorPromise(this.firstErrors) : new ValidatorPromise(this.problemElems);
  };

  /**
   * The actual check is done here
   * @param field
   * @param value
   * @returns {ValidatorCheckFeedback}
   */
  Validator.prototype.check = function (field, value) {
    var _this3 = this;

    var rulesForThisField = this.rules[field];
    var allErrors = [];
    var status = true;

    // get the names of the rules registered with the current form field
    var registeredRuleNames = this.getRulesRegisteredOn(field);

    // get the rule checkers for all the rules registered with the current form field
    // from the rules manager object
    var ruleCheckers = this.rm.getRulesByNames(registeredRuleNames);

    // validate the element with the rule object for each of the rules registered on it
    ruleCheckers.forEach(function (ruleChecker) {
      var idealValue = _this3.getIdealValue(ruleChecker.name, rulesForThisField);
      var alias = _this3.getIdealValueAlias(ruleChecker.name, rulesForThisField);
      var checkerFeedback = ruleChecker.check(value, idealValue, alias);
      if (checkerFeedback.status === false) {
        status = false;
        allErrors.push(checkerFeedback);
      }
    });

    return new ValidatorCheckFeedback(status, allErrors);
  };

  /**
   * This returns the names of all the rules registered on a particular field
   * @param field
   * @returns {Array}
   */
  Validator.prototype.getRulesRegisteredOn = function (field) {
    var rulesForThisField = this.rules[field]; // this returns all the rules registered on a field with their
    // standard/ideal values.
    var onlyNames = [];
    rulesForThisField.forEach(function (rule) {
      // what is happening here is that we are parsing the current rule
      // and extracting only the name
      // remember that the format for rule registration is "some-rule=idealValue"
      var split = rule.split('=');

      onlyNames.push(split[0]); // add the first element which should be the name
    });
    return onlyNames;
  };

  /**
   * This helper method gets the reference value or standard/ideal value as I prefer to call it of a rule
   * registered with an element
   * It scans the fieldRules and gets the member that starts with the ruleName. It then extracts the
   * ideal value by getting the token after the '=' sign
   * Example
   *    getStandardValue('maxLength', ['maxLength=20', 'minLength=5']) // returns 20
   *
   * @param ruleName
   * @param rulesForAField
   * @returns {*}
   */
  Validator.prototype.getIdealValue = function (ruleName, rulesForAField) {
    var target = '';
    rulesForAField.forEach(function (rule) {
      if (rule.indexOf(ruleName) === 0) target = rule;
    });
    var arr = target.split(/[=.]/);

    // if the array's length is equal to three, then there is an alias and the ideal value is the middle element
    // if it is 2, there is no alias so the ideal value alias is the last element which is also the ideal value
    var idealValue = null;
    if (arr.length === 3 || arr.length === 2) idealValue = arr[1];else idealValue = "true";

    return idealValue;
  };

  Validator.prototype.getIdealValueAlias = function (ruleName, rulesForAField) {
    var target = '';
    rulesForAField.forEach(function (rule) {
      if (rule.indexOf(ruleName) === 0) target = rule;
    });
    var arr = target.split(/[=.]/);
    return arr[arr.length - 1];
  };

  /**
   * It runs a callback you want to execute before the validator starts validating
   * An Ideal use case is removing custom error classes from html document before running
   * the validator again for the second time
   * @param callback
   * @returns {Validator}
   */
  Validator.prototype.runBefore = function (callback) {
    callback();
    return this;
  };

  /**
   * Wrapper to rule manager's add rule method. Adds a new custom rule to the validator
   * @param newRule {Rule}
   */
  Validator.prototype.addRule = function (newRule) {
    this.rm.addRule(newRule);
  };

  /**
   * Wrapper to rule manager's add rules method. Adds new custom rules to the validator
   * @param newRules {Array}
   */
  Validator.prototype.addRules = function (newRules) {
    this.rm.addRules(newRules);
  };

  /**
   * Wrapper to rule manager's getDefaultRuleNames method
   * @returns {Array}
   */
  Validator.prototype.getDefaultRuleNames = function () {
    return this.rm.getAllRuleNames();
  };

  /**
   * wrapper to RuleManager's getAllRuleNames method
   * @returns {Array}
   */
  Validator.prototype.getAllRuleNames = function () {
    return this.rm.getAllRuleNames();
  };

  /**
   * Wrapper to rule manager's getDefaultRules method
   * @returns {Array}
   */
  Validator.prototype.getDefaultRules = function () {
    return this.rm.getDefaultRules();
  };

  /**
   * Checks if an elem with given search criteria exists in an array
   * @param arr
   * @param searchCriteria
   * @returns {boolean}
   */
  function exists_in_array(arr, searchCriteria) {
    var found = false;
    arr.forEach(function (member) {
      if (searchCriteria(member)) found = true;
    });
    return found;
  }

  return Validator;
}();

/**
 * VALIDATOR PROMISE
 * This custom promise class executes success and failure callbacks
 * It takes an optional problem elements array in its constructor then determines if there is success or failure
 * by checking if the array is empty or populated
 */
var ValidatorPromise = function () {
  /**
   *
   * @param problemElems
   * @constructor
   */
  function ValidatorPromise(problemElems) {
    this.problemElems = problemElems;
  }

  /**
   * Runs the callback for success status
   * @param callback
   * @returns {ValidatorPromise}
   */
  ValidatorPromise.prototype.success = function (callback) {
    if (this.problemElems.length === 0) {
      callback();
    }
    return this;
  };

  /**
   * Runs the callback for failure status
   * @param callback
   * @returns {ValidatorPromise}
   */
  ValidatorPromise.prototype.failure = function (callback) {
    if (this.problemElems.length > 0) {
      callback(this.problemElems);
    }
    return this;
  };

  return ValidatorPromise;
}();

/**
 * VALIDATOR CHECK FEEDBACK
 * The structure of the feedback from the Validator object's check method
 */
var ValidatorCheckFeedback = function () {
  /**
   *
   * @param status
   * @param allErrors
   * @constructor
   */
  function ValidatorCheckFeedback(status, allErrors) {
    this.status = status;
    this.allErrors = allErrors;
  }

  return ValidatorCheckFeedback;
}();

module.exports = Validator;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Rule = __webpack_require__(0);

/**
 * RULE MANAGER
 */
var RuleManager = function () {
  /**
   * The default rules to use.
   *                      1. required
   *                      2. maxLength
   *                      3. minLength
   *                      4. exactLength
   *                      5. numeric
   * @type {Array}
   */
  var defaultRules = [
  /*
  Required rule
   */
  new Rule("required", "{:field} is required", function (value, idealValue) {
    return !!value;
  }),

  /**
   * Maximum Length rule
   */
  new Rule("maxLength", "{:field} should not exceed {:alias} characters", function (value, idealValue) {
    return value.length <= idealValue;
  }), new Rule("contains", "{:field} must contain {:alias}", function (value, idealValue) {
    return value.indexOf(idealValue) >= 0;
  }),

  /**
   * Minimum Length rule
   */
  new Rule("minLength", "{:field} cannot be less than {:alias} characters", function (value, idealValue) {
    return value.length >= idealValue;
  }),

  /**
   * Exact Length rule
   */
  new Rule("exactLength", "{:field} must contain exactly {:alias} characters", function (value, idealValue) {
    return value.length === parseInt(idealValue);
  }),

  /**
   * Numeric rule
   */
  new Rule("numeric", "{:field} must be a valid number", function (value, idealValue) {
    return isNumeric(value);
  })];

  function isNumeric(number) {
    // A Recursive approach
    if (number.length === 1) return !isNaN(parseInt(number));
    return !isNaN(parseInt(number[0])) && isNumeric(number.slice(1));
  }

  /**
   * Uses default rules if the parameter is empty
   * @param ruleSet
   * @constructor
   */
  function RuleManager(ruleSet) {
    var _definedRules = ruleSet || defaultRules;
    this.setDefinedRules(_definedRules);
  }

  /**
   * Returns the default rule objects
   * @returns {Array}
   */
  RuleManager.prototype.getDefaultRules = function () {
    return defaultRules;
  };

  /**
   * Returns the default rule object names
   * @returns {Array}
   */
  RuleManager.prototype.getDefaultRuleNames = function () {
    var names = [];
    defaultRules.forEach(function (rule) {
      names.push(rule.name);
    });
    return names;
  };

  /**
   * Sets the definedRules object
   * @param definedRules
   */
  RuleManager.prototype.setDefinedRules = function (definedRules) {
    if (!definedRules || !this.isValidRuleSet(definedRules)) {
      throw new Error("Argument should be an array of rules.");
    }
    this.definedRules = definedRules;
  };

  /**
   * Checks that all the contents of the ruleSet parameter are valid Rule instances
   * @param ruleSet
   * @returns {boolean}
   */
  RuleManager.prototype.isValidRuleSet = function (ruleSet) {
    var _this = this;

    ruleSet.forEach(function (rule) {
      if (!_this.isValidRule(rule)) {
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
    return rule instanceof Rule;
  };

  /**
   * Add a new rule to the definedRules array
   * @param newRule {Rule}
   */
  RuleManager.prototype.addRule = function (newRule) {
    if (!this.isValidRule(newRule)) {
      throw new Error("The new rule must be an instance of `Rule`");
    }
    // add it to the start of the array so it serves like an overwrite of any previous rule
    // with the same name
    this.definedRules.push(newRule);
  };

  /**
   * Adds all the rules passed as an array to the definedRules array
   * @param ruleSet {Rule[]}
   */
  RuleManager.prototype.addRules = function (ruleSet) {
    var _this2 = this;

    if (!this.isValidRuleSet(ruleSet)) {
      throw new Error("The rule set must only contain instances of `Rule`");
    }
    ruleSet.forEach(function (rule) {
      _this2.definedRules.push(rule);
    });
  };

  /**
   * Returns an array containing name property of all the rules in definedRules array
   * @returns {Array}
   */
  RuleManager.prototype.getAllRuleNames = function () {
    var names = [];
    this.definedRules.forEach(function (rule) {
      return names.push(rule.name);
    });
    return names;
  };

  /**
   * Checks if a rule is registered in the definedRules object
   * @param ruleName
   * @returns {boolean}
   */
  RuleManager.prototype.ruleExists = function (ruleName) {
    return this.getAllRuleNames().Contains(ruleName);
  };

  /**
   * Returns all the rule objects from defined rules whose name is contained in the ruleNames parameter
   * @param ruleNames
   * @returns {Array}
   */
  RuleManager.prototype.getRulesByNames = function (ruleNames) {
    var _this3 = this;

    // check if all the assigned rules are registered with the rule manager
    ruleNames.forEach(function (ruleName) {
      if (_this3.ruleExists(ruleName) === false) {
        throw new Error("The rule: " + ruleName + " is not registered with the rule manager");
      }
    });
    // return the rules
    var rules = [];
    this.definedRules.forEach(function (rule) {
      if (ruleNames.Contains(rule.name)) {
        rules.push(rule);
      }
    });
    return rules;
  };

  /**
   * Checking if an array contains an element
   * @param element
   * @returns {boolean}
   */
  Array.prototype.Contains = function (element) {
    var found = false;
    this.forEach(function (elem) {
      if (elem === element) {
        found = true;
      }
    });
    return found;
  };

  /**
   * Returns an array containing the values of an object
   * @param obj
   * @returns {Array}
   */
  Object.prototype.values = function (obj) {
    var _obj = obj || this;
    var keys = Object.keys(_obj);
    var values = [];
    keys.forEach(function (key) {
      return values.push(_obj.key);
    });
    return values;
  };

  /**
   * Converts an object to an array
   * @param obj
   * @returns {Array}
   */
  Object.prototype.toArray = function (obj) {
    if (obj instanceof Array) return obj;
    var _obj = obj || this;
    var arr = [];
    var keys = Object.keys(_obj);
    var values = Object.values(_obj);
    var index = 0;
    keys.forEach(function (key) {
      arr[key] = values[index++];
    });
    return arr;
  };

  return RuleManager;
}();

module.exports = RuleManager;

/***/ })
/******/ ]);
});