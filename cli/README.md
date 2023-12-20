# fass-cli
## Description
The fass-cli is a tool designed to streamline the process of scaffolding new services for the FAAS API and generating function templates for various HTTP methods. By installing the CLI globally and running the provided commands in the root of your project, you can easily set up and manage serverless functions.

Installation
To install the CLI globally, execute the following commands:

`cd cli && npm i -g`

## Adding a New Node Lambda with fass-cli
To add a new lambda function, use the following command: `fass-cli node-fun -hm <get post put patch create delete> -fn <name-in-kebab-case>`
- Replace <get post put patch create delete> with the desired HTTP method for your function.
- Replace <name-in-kebab-case> with a unique name for your function in kebab case.
This command, when executed in the root of your project, will scaffold a new function, create a Node.js lambda handler, and add the lambda to the AWS SAM template.
- Once the new lambda is added, you can access it on the development server at `/faas/name-in-kebab-case`. When deployed live, the lambda will be available at `/name-in-kebab-case`.
