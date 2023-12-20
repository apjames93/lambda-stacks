const camelcaseName = (functionName) => functionName.split('-').map((v, i) => {
    if (i === 0) return v
    return `${v[0].toLocaleUpperCase()}${v.substring(1)}`
 }).join('')


 module.exports = camelcaseName;