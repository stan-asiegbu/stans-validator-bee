# stans-validator-bee
The validation bee or just bee as I prefer to call it is a very flexible validator that allows for easy and flawless creation of custom 
validation rules. It provides a very easy and intuitive api for usage as you will see shortly. It is also unobtrusive as it just
provides you with erring elements without doing anything to the DOM or styling any element. Those activities are left to you to 
handle as you think best. This is my little way of giving back to the community which has provided so many frameworks and libraries
for free<br>
Let's start!


### npm
`npm install stans-validator-bee` <br>

#### In the browser
To use it directly in the browser, go to the dist folder and include the either the development 
or minified version of the `validate.js` file. Unfortunately the bee has not been uploaded to any
cdn yet<br>


#### As a node module
To use it as a node module, you have to import the `Validator` class

```javascript
import {Validator} from 'stans-validator-bee'

// or for CommonJS
const {Validator} = require('stans-validator-bee')
```
if you want to create a custom rule, then you also have to import the `Rule` class too

```javascript
import {Rule} from 'stans-validator-bee'

// or for CommonJS
const {Rule} = require('stans-validator-bee')
```

## USAGE
### Validating a form
**Before the example let me mention that the default rules/rule checkers bundled with the bee are
required, maxLength, minLength, numeric and exactLength. you can see them by running the following 
code**

```javascript
let validator = new Validator()
console.log(validator.getDefaultRuleNames())
```
**You can extend the strength of the bee by adding custom rules as you will learn shortly**

Assuming we have a form with four fields. username, password, email and phone and the validation goals are: <br>
username: is required, should not be less than five characters and not more than 15 characters<br>
password: is required and should not be less than six characters<br>
email: is required and should not be more than 20 characters<br>
phone: is required, should be numeric and should be exactly 11 characters <br>

We first of all create the rules object like this:

```javascript
  const rules = {
    username: ['required=true', 'maxLength=15', 'minLength=5'],
    password: ['required=true', 'minLength=6'],
    email: ['required=true', 'maxLength=20'],
    phone: ['required', 'numeric=true', 'exactLength=11.eleven']
  }
```

The above code is pretty intuitive. A few worthy mentions are that `['required=true']` and `['required']`
mean the same thing. the latter is just a shorthand. It also follows that `['numeric=true']` and `['numeric']`
should mean the same thing. Any rule that has a boolean value as it's ideal value follows this format.<br>
Also you may notice the `[..., 'exactLength=11.eleven']` element in the array of rules specified for the `phone`
field. The bee uses optional aliases to name ideal values. This may not be very clear now but will be when you read the
'Creating Custom Rules' section. It basically tells it to display 'eleven' and not '11' in the feedback message.


_Note: the keys for the rules object must EXACTLY match the NAME attributes of the form fields they represent.
This means that you cannot represent a form field with name `user_name` with `username` in the rules object.
The bee will simple throw an error <br>
Also note that fields in the form not specified in the rules object will not be validated._
    
Now let's use the validator with the rules specified. We will wrap everything in a validate function that runs on
button clicked to make things easier for us and since we also want to do things after validation based on success 
status, we will create success and failure handling functions too which will be executed as callbacks as we shall 
see shortly

```javascript
    function validate(event) {
        event.preventDefault()
        // create new validator object
        let validator = new Validator()

        // specify form id
        let formID = 'myForm'

        // validate
        validator.target(formID)
            .use(rules)
            .validate()
            .success(() => { handleSuccess() })
            .failure((problemElems) => { handleFailure(problemElems) })
    }

    function handleSuccess() {
        console.log('validation successful!')
    }

    function handleFailure(problemElems) {
        console.log(problemElems)
    }
```
we create the validator object. Then we specify the form Id of the target form and pass it to the 
`target()` method.

_Note: The `target()` method expects a valid ID of the form to be validated. Only the ID attribute
is allowed. You should give your form an ID attribute if it does not already have one_

We then pass the `rules` object to the `use()` method so it can use it to validate the
form.<br>
The `validate()` method validates the form and returns a promise than executes success and failure 
states for the validator given the appropriate callback functions. The `success()` method is not
very interesting. It just executes code in the callback. The `failure()` is a callback that acts 
on the problem elements (elements whose values failed the rules applied on them) passed to it during validation.<br>

The format of the problemElems array is

```javascript
   let problemElems = [
     {
       selector: "elemSelector",
       msg: "failure message"
     }
     // ...
   ]
```

The `selector` is the document selector string for the problem element and the `msg` is a 
string explaining what is expected in the given value.<br>
That's all for using the default rules for now. Let's move one step further and create our own custom rules.<br>


### Creating Custom Rules
Assuming I want to specify that the username field should not contain a particular word in it, I have to create 
a custom rule for handling that. The bee makes it really easy to do this. We shall now create a rule that goes 
by the name 'not-contain' and register it on the 'username' form field.

```javascript
    validator.addRule(new Rule('not-contain', '{:field} cannot contain the word `{:alias}`', (value, idealValue) => {
        return value.toLowerCase().indexOf(idealValue.toLowerCase()) < 0
    } ))

    // registering it to the username field will now look like this
    const rules = {
        username: ["required=true", "maxLength=15", "minLength=5", "not-contain=badword"],
        ...
    }
```

This looks like a lot of code but it isn't. Let's break it down.<br>
The validator object has an `addRule` method that takes as a parameter a `Rule` object.<br>
The `Rule` object's constructor takes the following as parameters:<br>
1. name - name of the rule <br>
2. feedback message - the message to describe the requirements expected of a field that failed it's test <br>
3. passCriteria - this is a callback function that takes two values. the entered value to be checked against an
ideal value. it returns the result of a condition that checks if a given value PASSES (not fails) the format
of the ideal value which it is being checked against.<br>

Looking at the feedback message we will notice two template-like strings, `'{:field}'` and `'{:alias}'`<br>
These are just there to increase the flexibility or make the feedback message more customizable.<br>
The `'{:field}'` template simply gets replaced with the defaulting form field name if it is present in the
feedback message string specified when creating a new rule.<br>

The bee uses optional aliases to name ideal values. If an alias is provided during registration on an element,
it replaces `'{:alias}'` in the feedback message instead of the value itself.<br>
Example: writing `... email: ['maxLength=30.thirty'] ...` will result in the message `"email must not exceed 
thirty characters.` while `... email ['maxLength=30'] ...` will result in the message `"email must not 
exceed 30 characters.`<br>

Registering this custom rule is just the same as registering the bundled rules on a form field


This is pretty much it for now. Feel free to extend the powers of the bee to make it sting when it should.
It is all up to your imagination. With luck more features will be coming in the next version.
