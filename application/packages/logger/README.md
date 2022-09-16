# `@gradientedge/mach-common-logger`

A logger package, to allow different logging messages with different log-levels. In a deployed application, the log-level
can be changed to filter out low-level messages but retain higher level. Typically in production only `ERROR` and possibly 
`WARN` level messages are logged.

In development, it can be changed to `DEBUG` to increase the information available to understand the flow.

Supported levels:

* Error: A problem that requires fixing occurred
* Warn: A warning that you may want to address occurred
* Info: Informational logging, does not require action
* Debug: Debugging information to understand the flow of the application and the data that is being processed

When logging, try to add information that helps understanding the context of the problem. However be careful with sensitive data including customer name/address information (including customer id), etc.
The first argument of all log methods is a string to be logged, and it is possible to add additional parameters to log entire objects.

## Usage

```
const logger = require('@gradientedge/wcc-logger');

log.info('Some message')
log.error('Error message', object1, object 2)

// Good practice: add a caught exception in a wrapper object
try {
   someFunction()
} catch (e) {
  log.error('Failed someFunction', {error: e})
}
```
