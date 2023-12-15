## Overview

This project leverages the AWS SAM CLI to manage the deployment of multiple lambdas. The process is streamlined using the `faas-cli`, which allows for easy scaffolding of lambda functions.

## Getting Started

### Prerequisites

Ensure the following software is installed before using this project:

- AWS SAM CLI
- Docker
- Node.js 20.X
- faas-cli

### Installation

1. Clone the repository: `git clone https://github.com/<username>/<repository>.git`
2. Navigate to the project directory: `cd <repository>`
3. Install dependencies: `npm i`

### Configuration

Configure the project before use:

1. Add a `.env` file for local development.
2. Add a `.test.env` file for testing.

### Usage

Follow these steps to use the project:

1. **Testing with Jest:**
   - Run all tests and output coverage: `npm run test`
   - Run tests for a specific file: `npm run test <file-name>`
   - Run tests and automatically rerun on code changes: `npm run test:watch`

2. **Starting Local Servers:**
   - To start a local Express server for development, run: `npm start`
   - To start the AWS SAM local API server, run: `npm run sam:start`
     - Note: The SAM server does not support hot reloads and needs to be restarted after code changes to apply Lambda layer updates.

### Adding a New Lambda with the faas-cli

To add a new Lambda function to the project, follow these steps:

1. Run the command `faas-cli node-fun -hm <get post put patch create delete> -fn <name-in-kebab-case>` in the root of the project to scaffold a new Lambda and AWS SAM template YAML file.
2. Develop and test your function with Jest by running `npm run test`.
3. Run `npm start` or `npm run sam:start` to access the new Lambda route locally.
   - The new Lambda can be accessed at `/faas/name-in-kebab-case`.
   - Once deployed to a live environment, it will be available at `/name-in-kebab-case`.

## Formatting Code

This project uses a pre-commit hook with Husky to ensure the code is properly formatted and buildable. Use the following commands:

- `npm run format`: Runs Prettier and formats the code under `src/`.
- `npm run lint`: Lints the code.
- `npm run clean-code`: Runs both formatting and linting commands.

## Project File Structure

Use the `faas-cli` to generate new functions:

```
|-- template.yaml
|-- package.json
|-- src
  |-- lambdas
    |-- <HTTP METHOD> (e.g., get, put, post, create, delete)
      |-- <LAMBDA-NAME>
        |-- <LAMBDA NAME>.ts
        |-- test
          |-- events
            |-- event.json
          |-- <LAMBDA NAME>.test.ts
  |-- test-helpers
    |-- factories
      |-- <MODEL>.ts
  |-- utils
    |-- <UTIL-NAME>
      |-- <UTIL-NAME>.ts
```