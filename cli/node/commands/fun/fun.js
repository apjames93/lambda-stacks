const resolve = require('path').resolve
const fs = require('fs-extra')
const prependFile = require('prepend-file');
const { dirname } = require('path');

const titleCase = require('../../../utils/titleCaseName');

const appDir = dirname(require.main.filename);

module.exports = async (args) => {
    const { httpMethod, functionName } = args
    const cwd = resolve(`./`)
    const http = httpMethod.toLowerCase()
    const titleCaseHttp = titleCase(httpMethod)
    const titleCaseName = titleCase(functionName)

    // add function to layers
    const functionPath = `${cwd}/node/src/lambdas/${http}/${functionName}`
    await fs.copy(`${appDir}/node/commands/fun/templates/fun/function/`, functionPath)
    await fs.rename(`${functionPath}/function.ts`, `${functionPath}/${functionName}.ts`)
    await prependFile(`${functionPath}/tests/function.test.ts`, `import method from '../${functionName}';\n`);
    await fs.rename(`${functionPath}/tests/function.test.ts`,  `${functionPath}/tests/${functionName}.test.ts`)

    // add template to sam yml
    const samTemplatePath = `${cwd}/node/template.yaml`

    const lambda = 
`
  ${titleCaseHttp}${titleCaseName}Function:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: dist/lambdas/${http}/${functionName}/
      Handler: ${functionName}.default
      Runtime: nodejs20.x
      Architectures:
        - x86_64
      Events:
        Base:
          Type: Api
          Properties:
            Path: /${functionName}
            Method: ${http}

`
     await fs.appendFile(samTemplatePath, lambda)


    console.log(`
    #####################################################
    Function Path: ${functionPath}/${functionName}.ts
    #####################################################
        `)

    return process.exit(0)
}