# Halo Code Convention

Halo use eslint to detect errors and potential problems. The options for ESlint are stored in a [.eslintrc](./eslintrc) file.

## File encoding:

Source files are encoded in UTF-8.

## Modules

It is recommended to use CommonJS, ES6 Modules is not recommended(Not mandatory).

```javascript
// file ustack.js
module.exports = {
  website: 'https://www.ustack.com/'
};

/* ---- */

// file website.js
let website = require('ustack.js').website;

```

## ES6

you can use ES6 to write code, webpack will use [babel](https://github.com/babel/babel) to transpile it.

## Spacing

* Indentation with two **spaces**.
* No line break before the opening brace.
* Line break after the opening brace and line break before the closing brace.
* No whitespace at the end of line or on blank lines.
* `if`/`else`/`for`/`while`/`try` always have braces and always go on multiple lines.
* Unary special-character operators (e.g., !, ++) must not have space next to their operand.
* Any `;` must not have preceding space.
* Any `;` used as a statement terminator must be at the end of the line.
* The `?` and `:` in a ternary conditional must have space on both sides.
* Any `:` after a property name in an object definition must not have preceding space but need following space.
* No filler spaces in empty constructs (e.g., {}, [], fn())
* New line at the end of each file.

### Examples

```javascript
// The following code is only used to display the syntax
let ustack = () => {
  let youWantToJoin = Math.random() > 0.001 : !!(Math.random() > 0.001) : false;
  let members = [];
  if (youWantToJoin) {
    for (let i = 0; i < 10; i++) {
      members[i] = i;
    }
  } else {
    console.log('please visit https://www.ustack.com and decide again ^_^');
  }
}

```

## Equality

Strict equality checks `===` must be used in favor of abstract equality checks `==`.

## Quotes
String uses single quotes.

```javascript
var str = 'single quote';

// double quotes
var double = '<div class="test">test</div>';

/*
 * jsx - double quotes
 * <div className="name"></div>
 */

```

## Comments

Single line comments

```javascript
// example
var foo = "bar";

```

Multi-line comments

```javascript
/**
 * @param something {Array | String}
 * @returns {object}
 */

var func = (something) => {
  // do something
}

```

Inline comments

```javascript
var func = (a, b, c/* param c */, d) => {
  // do something
}

```

## Naming Conventions

Using camel case with a lowercase first letter. Names should be descriptive but not excessively so. 

```javascript
var startCount = 1;
var endCount = 2;

```

## Class literals

Class literals (whether declarations or expressions) are indented as blocks. Do not add semicolons after methods.

```javascript
class Foo {
  constructor() {
    /*
     * @type {number}
     */
    this.x = 42;
  }

  /*
   * @return {number}
   */
  method() {
    return this.x;
  }
}
```

## var, let, const

Declare all local variables with either `const` or `let`. Use `const` by default, unless a variable needs to be reassigned. The `var` keyword is not recommended.


## Thanks

* [jQuery Style Guide](http://contribute.jquery.org/style-guide/js/)
* [Google JavaScript Style Guide](http://google.github.io/styleguide/jsguide.html)
