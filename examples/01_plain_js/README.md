# Example 01_plain_js

This example shows a basic web application using plain JavaScript without any framework or build process. The application provides several AI tools to illustrate different interactions.

## Implementation Notes
- No build process (other than npm install)
- javascript uses [native imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
- browser support for native import of css files is sketchy, so there is a JS utility to inject the style links
- NPM packages can be used, but only if they support being used direclty in the browser, many do not. this example uses the [history](https://www.npmjs.com/package/history) package to manage the browser history.
- Browser support for single page app style URL routing is good, but for easier hosting this example uses hash based routing
- local development server is provided by the `live-server` package, includes hot reload on file changes
