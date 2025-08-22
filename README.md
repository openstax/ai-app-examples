
# AI App Examples

This repository contains various examples of AI applications built using different technologies and frameworks. Each example demonstrates how to integrate AI capabilities, such as text generation, chat, and structured data generation, into a web application.

## Examples Overview
- 01_plain_js: A basic web application using plain JavaScript without any framework or build process. [README](./examples/01_plain_js) [demo](https://openstax.github.io/ai-app-examples/01_plain_js)


## Batteries Included
- All examles use OpenStax Accounts for authentication
- All examples use OpenStax's Promptly API for AI inference
- All examples retrieve a Promptly session token and use to authenticate API calls
- All examples have sample logic for naviagation, styling, and templating
- All examples include basic AI tools like Generate, Chat, and Structured Data Generation

## Running Locally
To run any of the examples locally, follow these steps:
1) clone the repository
1) run `npm install` in the root of the repository
1) navigate to the example directory (e.g., `cd examples/01_plain_js`)
1) run `npm install` [again but] in the example directory
1) run `npm start` to start the local server
    - you will be prompted for your Promptly API key on the first launch

## Deployment
Apps following this example can be deployed anywhere, but you will need a Promptly API key approved for your environment's hostname.

## OpenStax Promptly API

The OpenStax Promptly API provides a simple interface for integrating AI capabilities into your applications. It supports various AI tasks such as text generation, chat, and structured data generation. It also allows selecting from a variety of AI models from various providers. In the example apps, most tools offer a "Model" dropdown to select the AI model to use for the task, in production you'd want to set a default model for each tool and not allow the user to change it.

Your Promptly API Token has associated usage limits on a per-user and aggregate basis, this is a rolling monthly limit. If you exceed your usage limits, you will receive an error response from the API.
