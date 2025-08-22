# Example 01_plain_js

This example shows a basic web application using plain JavaScript without any framework or build process. The application provides several AI tools to illustrate different interactions.

## Batteries Included
- Uses OpenStax Account login for authentication
- Automatically redirects to authenticate when logged out
- Automatically retrieves a session token
- Uses OpenStax's Promptly API for AI inference
- Basic Single Page App (SPA) navigation
- Generate, Chat, and Assessment tools

## Implementation Notes
- No build process (other than npm install)
- javascript uses [native imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
- browser support for native import of css files is sketchy, so there is a JS utility to inject the style links
- NPM packages can be used, but only if they support being used direclty in the browser, many do not. this example uses the [history](https://www.npmjs.com/package/history) package to manage the browser history.
- Browser support for single page app style URL routing is good, but for easier hosting this example uses hash based routing
- local development server is provided by the `live-server` package, includes hot reload on file changes

## Running the Example Locally

1) clone the repository
1) run `npm install` in the root of the repository
1) navigate to /examples/01_plain_js
1) run `npm install` [again but] in the /examples/01_plain_js directory
1) run `npm start` to start the local server
    - you will be prompted for your Promptly API key on the first launch
