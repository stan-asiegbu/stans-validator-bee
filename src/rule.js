/**
 * RULE
 * @author Asiegbu Stanley C
 * @desc Describes the structure of a validation rule
 */
let Rule = (function () {
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
    this.passCriteria = passCriteria
  }

  /**
   *
   * @param value
   * @param idealValue
   * @param idealValueAlias Optional
   * @returns {*}
   */
  Rule.prototype.check = function (value, idealValue, idealValueAlias = null) {
    if (this.passCriteria(value, idealValue)) {
      return {status:true, msg:null, idealValue: idealValue}
    }
    let msg = this.errMsg.replace("{:alias}", idealValueAlias)
    return {
      status: false,
      msg: msg,
      idealValue: idealValue
    }
  };


  return Rule;
}());

module.exports = Rule