const fs = require('fs')
const path = require('path')
const { modules, parentModules } = require('./modules')
const template = fs.readFileSync(__dirname + '/template.js').toString()

const createBundle = (fileName, config) => {
  const bundle = Object.keys(modules).map(key => {
    return [
      `// module ${key}`,
      `function (require, module, exports) {`,
      modules[key],
      `}`
    ].join('\n')
  })

  const outputModules = bundle.join(',\n\n')

  const outputFile = template + JSON.stringify(parentModules) + ', [' + outputModules + '])'

  fs.writeFileSync(path.resolve(config.output.dirname, fileName), outputFile)
}

module.exports = createBundle