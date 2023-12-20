const titleCaseName = (functionName) => functionName.split('-').map((v, i) => { 
    return `${v[0].toLocaleUpperCase()}${v.substring(1)}`
}).join('')    

module.exports = titleCaseName;
