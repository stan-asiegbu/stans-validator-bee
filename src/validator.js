let RuleManager = require('./rule_manager')

/**
 * STAN'S FORM VALIDATOR
 * @author Asiegbu Stanley C
 * Date: 31st October, 2017
 *
 * @desc
 * It is the actual form data validator
 */
let Validator = (function() {
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
    this.problemElems = []

    /**
     * Contains the elements that did not pass the rules registered on them
     * Only the first rules failed by an element is contained here
     * @type {Array}
     */
    this.firstErrors = []

    /**
     * Determines whether to return only the first errors encountered for each field after validation
     * If set to false, validate function returns all problem elements array to the promise
     * @type {boolean}
     */
    this.useFirstErrors = false

    /**
     * The Id of the container element that contains the form fields
     * @type string
     */
    this.targetId = formId

    /**
     * The form data to be validated
     */
    this.formData = formData

    /**
     * Names of all the fields registered to be validated
     * @type {Array}
     */
    this.registeredFields = []

    /**
     * This is the private rule manager object
     * It manages all actions related to rules like adding a custom rule.
     * The validator class acts as an interface to it
     * @type {RuleManager}
     */
    this.rm = new RuleManager()
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
  Validator.prototype.target = function(formId) {
    this.targetId = formId
    return this
  }

  /**
   * Sets the rules to validate the form against
   * @param rules
   * @returns {Validator}
   */
  Validator.prototype.use = function(rules) {
    this.rules = rules
    return this
  }

  /**
   * sets the form data to be validated
   * @param formData
   * @returns {Validator}
   */
  Validator.prototype.setData = function(formData) {
    this.formData = formData
    return this
  }

  /**
   * builds up the form data
   * @param formId
   */
  Validator.prototype.buildFormData = function(formId) {
    // get all fields registered for validation
    let fields = this.getRegisteredFieldNames(this.rules)

    // set the property
    this.registeredFields = fields

    // create object
    let formData = {}
    fields.forEach(field => {
      // get field value
      formData[field] = document.querySelector('#' + formId + " *[name='" + field + "']")
    })
    this.formData = formData
  }

  /**
   * Returns the name of all registered fields from field validation registration array
   * @param registeredFields
   * @returns {Array}
   */
  Validator.prototype.getRegisteredFieldNames = function(registeredFields) {
    return Object.keys(registeredFields)
  }

  /**
   * This is where the actual validation algorithm takes place
   * @returns {ValidatorPromise}
   */
  Validator.prototype.validate = function() {
    let _this = this
    this.buildFormData(this.targetId)

    // Check if the validator object passes all criteria before validating
    if (this.formData === null) throw new Error('The `data` cannot be null')
    if (this.targetId === '')
      throw new Error('The `targetId` property cannot be null')
    if (this.rules === null)
      throw new Error('The `rules` property cannot be null')

    // Get all the form fields that were registered for validation
    // Unregistered fields will be ignored
    let fields = this.registeredFields
    fields.forEach(field => {
      // Get the DOM object for the field
      let elem = document.querySelectorAll("*[name='" + field + "']")[0]
      let elemValue = elem.value

      let feedback = this.check(field, elemValue)
      if (feedback.status === false) {
        // The field did not pass the test so add it to the problem elements array
        let tagName = document.getElementsByName(field)[0].tagName
        let selector =
          '#' + _this.targetId + ' ' + tagName + "[name='" + field + "']"

        feedback.allErrors.forEach(error => {
          let errorFeedback = {
            selector: selector,
            msg: error.msg.replace('{:field}', field)
          }

          // add the new feedback to the problem elements array
          this.problemElems.unshift(errorFeedback)

          // check if this field already has an error in the first errors array
          // if it does not have, add this error to the array
          if (
            !exists_in_array(this.firstErrors, err => {
              return err.selector === selector
            })
          ) {
            this.firstErrors.push(errorFeedback)
          }
        })
      }
    })
    // return a promise that will execute success and failure callbacks that are passed to it
    return this.useFirstErrors
      ? new ValidatorPromise(this.firstErrors)
      : new ValidatorPromise(this.problemElems)
  }

  /**
   * The actual check is done here
   * @param field
   * @param value
   * @returns {ValidatorCheckFeedback}
   */
  Validator.prototype.check = function(field, value) {
    let rulesForThisField = this.rules[field]
    let allErrors = []
    let status = true

    // get the names of the rules registered with the current form field
    let registeredRuleNames = this.getRulesRegisteredOn(field)

    // get the rule checkers for all the rules registered with the current form field
    // from the rules manager object
    let ruleCheckers = this.rm.getRulesByNames(registeredRuleNames)

    // validate the element with the rule object for each of the rules registered on it
    ruleCheckers.forEach(ruleChecker => {
      let idealValue = this.getIdealValue(ruleChecker.name, rulesForThisField)
      let alias = this.getIdealValueAlias(ruleChecker.name, rulesForThisField)
      let checkerFeedback = ruleChecker.check(value, idealValue, alias)
      if (checkerFeedback.status === false) {
        status = false
        allErrors.push(checkerFeedback)
      }
    })

    return new ValidatorCheckFeedback(status, allErrors)
  }

  /**
   * This returns the names of all the rules registered on a particular field
   * @param field
   * @returns {Array}
   */
  Validator.prototype.getRulesRegisteredOn = function(field) {
    let rulesForThisField = this.rules[field] // this returns all the rules registered on a field with their
    // standard/ideal values.
    let onlyNames = []
    rulesForThisField.forEach(rule => {
      // what is happening here is that we are parsing the current rule
      // and extracting only the name
      // remember that the format for rule registration is "some-rule=idealValue"
      let split = rule.split('=')

      onlyNames.push(split[0]) // add the first element which should be the name
    })
    return onlyNames
  }

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
  Validator.prototype.getIdealValue = function(ruleName, rulesForAField) {
    let target = ''
    rulesForAField.forEach(rule => {
      if (rule.indexOf(ruleName) === 0) target = rule
    })
    let arr = target.split(/[=.]/)

    // if the array's length is equal to three, then there is an alias and the ideal value is the middle element
    // if it is 2, there is no alias so the ideal value alias is the last element which is also the ideal value
    let idealValue = null
    if (arr.length === 3 || arr.length === 2) idealValue = arr[1]
    else idealValue = "true"

    return idealValue
  }

  Validator.prototype.getIdealValueAlias = function(ruleName, rulesForAField) {
    let target = ''
    rulesForAField.forEach(rule => {
      if (rule.indexOf(ruleName) === 0) target = rule
    })
    let arr = target.split(/[=.]/)
    return arr[arr.length - 1]
  }

  /**
   * It runs a callback you want to execute before the validator starts validating
   * An Ideal use case is removing custom error classes from html document before running
   * the validator again for the second time
   * @param callback
   * @returns {Validator}
   */
  Validator.prototype.runBefore = function(callback) {
    callback()
    return this
  }

  /**
   * Wrapper to rule manager's add rule method. Adds a new custom rule to the validator
   * @param newRule {Rule}
   */
  Validator.prototype.addRule = function(newRule) {
    this.rm.addRule(newRule)
  }

  /**
   * Wrapper to rule manager's add rules method. Adds new custom rules to the validator
   * @param newRules {Array}
   */
  Validator.prototype.addRules = function(newRules) {
    this.rm.addRules(newRules)
  }

  /**
   * Wrapper to rule manager's getDefaultRuleNames method
   * @returns {Array}
   */
  Validator.prototype.getDefaultRuleNames = function() {
    return this.rm.getAllRuleNames()
  }

  /**
   * wrapper to RuleManager's getAllRuleNames method
   * @returns {Array}
   */
  Validator.prototype.getAllRuleNames = function () {
    return this.rm.getAllRuleNames()
  }

  /**
   * Wrapper to rule manager's getDefaultRules method
   * @returns {Array}
   */
  Validator.prototype.getDefaultRules = function() {
    return this.rm.getDefaultRules()
  }

  /**
   * Checks if an elem with given search criteria exists in an array
   * @param arr
   * @param searchCriteria
   * @returns {boolean}
   */
  function exists_in_array(arr, searchCriteria) {
    let found = false
    arr.forEach(member => {
      if (searchCriteria(member)) found = true
    })
    return found
  }

  return Validator
})()

/**
 * VALIDATOR PROMISE
 * This custom promise class executes success and failure callbacks
 * It takes an optional problem elements array in its constructor then determines if there is success or failure
 * by checking if the array is empty or populated
 */
let ValidatorPromise = (function() {
  /**
   *
   * @param problemElems
   * @constructor
   */
  function ValidatorPromise(problemElems) {
    this.problemElems = problemElems
  }

  /**
   * Runs the callback for success status
   * @param callback
   * @returns {ValidatorPromise}
   */
  ValidatorPromise.prototype.success = function(callback) {
    if (this.problemElems.length === 0) {
      callback()
    }
    return this
  }

  /**
   * Runs the callback for failure status
   * @param callback
   * @returns {ValidatorPromise}
   */
  ValidatorPromise.prototype.failure = function(callback) {
    if (this.problemElems.length > 0) {
      callback(this.problemElems)
    }
    return this
  }

  return ValidatorPromise
})()

/**
 * VALIDATOR CHECK FEEDBACK
 * The structure of the feedback from the Validator object's check method
 */
let ValidatorCheckFeedback = (function() {
  /**
   *
   * @param status
   * @param allErrors
   * @constructor
   */
  function ValidatorCheckFeedback(status, allErrors) {
    this.status = status
    this.allErrors = allErrors
  }

  return ValidatorCheckFeedback
})()

module.exports = Validator