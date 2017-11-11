'use strict';

function validate(event) {
  event.preventDefault();
  // we first of all clear all the error classes injected in the html
  removeErrors();

  // create an instance of the validator
  var validator = new Validator();

  // we are creating a custom rule 'not-contain' that will check if a word does not contain a particular
  // word
  validator.addRule(new Rule('not-contain', '{:field} must not contain the word `{:alias}`',
    function (value, idealValue) {
      return value.toLowerCase().indexOf(idealValue.toLowerCase()) < 0;
  }));

  // registering the rules on the elements
  var rules = {
    username: ['required=true', 'maxLength=15', 'minLength=5.five', 'not-contain=bad-word'],
    password: ['required=true', 'minLength=5.five'],
    email: ['required=true', 'maxLength=30', 'minLength=5.five'],
    phone: ['required=true', 'numeric=true', 'exactLength=11.eleven']
  };

  // validate the form
  validator.target('myForm')
    .use(rules)
    .validate()
    .success(function () {
      handleSuccess();
  }).failure(function (problemElems) {
      handleProblemElems(problemElems);
  });
}

function handleSuccess() {
  document.querySelector(".alert").style.display = "block";
}

// removes all the error classes in the DOM
function removeErrors() {
  var errors = document.querySelectorAll('small.err-msg');
  if (errors.length > 0) {
    for (var i = 0; i < errors.length; i++) {
      errors[i].style.display = 'none';
      errors[i].innerText = '';
    }
  }
}

// displays the errors in the DOM
function handleProblemElems(problemElems) {
  // hide the previous success message if any
  document.querySelector(".alert").style.display = "none";

  // display the errors
  problemElems.forEach(function (elem) {
    var element = document.querySelector(elem.selector);
    var err = element.nextElementSibling;
    err.style.display = 'block';
    err.innerText = elem.msg;
  });
}