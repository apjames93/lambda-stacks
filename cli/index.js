#! /usr/bin/env node

const { program } = require('commander')
const fun = require('./node/commands/fun/fun')

program
    .command('node-fun')
    .requiredOption('-hm, --http-method <httpMethod>', 'http method the function will be added to ex: "get post put patch create delete')
    .requiredOption('-fn, --function-name <functionName>', 'Name of the function ex: "new-lambda"')
    .description('Run in the root of project to scaffold a node lambda function')
    .action(fun)

program.parse()

