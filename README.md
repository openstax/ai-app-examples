
# AI App Examples

This repository contains various examples of AI applications built using different technologies and frameworks. Each example demonstrates how to integrate AI capabilities, such as text generation, chat, and structured data generation, into a web application.

## Examples Overview
- 01_plain_js: [README](./examples/01_plain_js) · [demo](https://openstax.github.io/ai-app-examples/01_plain_js) · A basic web application using plain JavaScript without any framework or build process.

## Batteries Included
- All examles use OpenStax Accounts for authentication
- All examples use OpenStax's Promptly API for AI inference
- All examples retrieve a Promptly session token and use it to authenticate API calls
- All examples have sample logic for naviagation, styling, and templating

  
## Sample Tools

Each example implements the same set of tools. These are very basic, they can serve as a starting point, and also as a way to compare the different examples through similar functionality.

### Generate Text

The most basic tool, generating a single response from a single prompt. This can be a starting point for more complicated response formatting (html / markup / embedded stuff) or other prompt engineering. Layering custom functionality over generated responses with special formatting (established through the prompt) can have powerful results.

### Chat

Very similar to "Generate Text" but with conversation structure. As an application developer trying to deliver value through a structured experience, Chats requre some setup with context and system prompts in order to achieve a specific goal.

### Structured Data

The same idea as "Generate Text", but with structured json output controlled by a schema the application defines. The examples uses two schemas to both generate and score assessment questions.

Some providers have better integration with the schema generation than others, try experimenting with different options for the best results.

There is a lot of room for prompt engineering and flow enhancements on this one. Notice that the tool will generate similar questions over and over again, or that sometimes multiple choice questions have subjective / inconclusive answers. 

### Put it Together 

Interesting use cases will often put many techniques together. Generate Text for a case study, then generate questions about it. Launch a chat with a Socratic dialog if the questions are answered incorrectly. Powerful applications will leverage combinations of techniques.

## Running Locally
To run any of the examples locally:
1) clone the repository
1) run `npm install` in the root of the repository
1) navigate to the example directory (e.g., `cd examples/01_plain_js`)
1) run `npm install` [again but] in the example directory
1) run `npm run start` to start the local server
    - you will be prompted for your Promptly API key on the first launch

## Deployment
Apps following this example can be deployed anywhere, but you will need a Promptly API key approved for your environment's hostname. This example repository deploys to GitHub Pages.

## OpenStax Promptly API

The OpenStax Promptly API provides a simple interface for integrating AI capabilities into your applications. It supports various AI tasks such as text generation, chat, and structured data generation. It also allows selecting from a variety of AI models from various providers. In the example apps, most tools offer a "Model" dropdown to select the AI model to use for the task, in production you'd want to set a default model for each tool and not allow the user to change it.

Your Promptly API Token has associated usage limits on a per-user and aggregate basis, this is a rolling monthly limit. If you exceed your usage limits, you will receive an error response from the API.
