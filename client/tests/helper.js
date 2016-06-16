
import util from 'util';

// Use console warnings and errors as flags.
var consoleWarn = console.warn;
var consoleError = console.error;

function logToError() {	
  throw new Error(util.format.apply(this, arguments).replace(/^Error: (?:Warning: )?/, ''));
}

// Throw errors to the console and fail test.
before(function() {
  console.warn = logToError;
  console.error = logToError;
});

// Teturn console.warn and console.error to default behaviour.
after(function() {
  console.warn = consoleWarn;
  console.error = consoleError;
});
