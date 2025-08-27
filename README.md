
# AI App Examples

This app contains examples of basic AI interactions to be used as a starting point for building more complex experiences.

## Demo

A live demo of this app is available at: https://openstax.github.io/ai-app-examples/

## Batteries Included
- Deployable as a static site. No server required. Demo uses GitHub Pages.
- Uses OpenStax Accounts for authentication
- Uses OpenStax's Promptly API for AI inference
- Retrieves a Promptly session token and use it to authenticate API calls
- Sample logic for navigation, styling, form submissions, etc.
- Output formatting for the model responses including LaTeX math and markdown

## Implementation notes
- React with Vite
- no CSS framework, just simple CSS modules
- React Router for navigation
- Navigation with hash routing so it can be hosted on GitHub Pages

## Sample Tools

The homepage has links to three sample tools. These are very simple and are meant to provide example logic for the core types of interactions.

### Tools
#### Generate Text

The most basic tool, generating a single response from a single prompt. This can be a starting point for more complicated response formatting (html / markup / embedded stuff) or other prompt engineering. Layering custom functionality over generated responses with special formatting (established through the prompt) can have powerful results.

#### Chat

Very similar to "Generate Text" but with conversation structure. Chats are quintessential AI tools, but as an application developer trying to deliver value through a structured experience, Chats require some setup with context and system prompts in order to achieve a specific goal.

#### Structured Data

The same idea as "Generate Text", but with structured json output controlled by a schema the application defines. The examples uses two schemas to both generate and score assessment questions.

Some providers have better integration with the schema generation than others, try experimenting with different options for the best results.

There is a lot of room for prompt engineering and flow enhancements on this one. Notice that the tool will generate similar questions over and over again, or that sometimes multiple choice questions have subjective / inconclusive answers.

### Put it Together

Interesting use cases will often put many techniques together. Generate Text for a case study, then generate questions about it. Launch a chat with a Socratic dialog if the questions are answered incorrectly. Powerful applications will leverage combinations of techniques.

## Running Locally

This project uses [Vite](https://vitejs.dev/) as the build tool, if you encounter any problems, that is the search term you want to use.

To run this project locally:
1) clone the repository
1) run `npm install` in the root of the repository
1) run `npm run dev` to start the local server
    - you will be prompted for your Promptly API key on the first launch

### Scripts

`npm run dev` - start the local development server
`npm run ci` - run all checks
`npm run build` - build the app for production

## Adding Tools

The example tools are defined in separate pages in the `src/pages` directory. You can add additional tools by creating new pages and adding them to the router in `src/main.jsx`, and linking to them from the homepage at `src/pages/Home/index.tsx'.

## Deployment
Apps following this example can be deployed anywhere, but you will need a Promptly API key approved for your environment's hostname. This example repository deploys to GitHub Pages.

## OpenStax Promptly API

The OpenStax Promptly API provides a simple interface for integrating AI capabilities into your applications. It supports various AI tasks such as text generation, chat, and structured data generation. It also allows selecting from a variety of AI models from various providers. In the example apps, most tools offer a "Model" dropdown to select the AI model to use for the task, in production you'd want to set a default model for each tool and not allow the user to change it.

Your Promptly API Token has associated usage limits on a per-user and aggregate basis, this is a rolling monthly limit. If you exceed your usage limits, you will receive an error response from the API.
