const fs = require('fs')
const path = require('path')
const template = fs.readFileSync(__dirname + '/template.js').toString()

const createBundle = (fileName, config, modules) => {
  const bundle = Object.keys(modules.modules).map(key => {
    return [
      `// module ${key}`,
      `function (require, module, exports) {`,
      modules.modules[key],
      `}`
    ].join('\n')
  })

  const outputModules = bundle.join(',\n\n')

  const outputFile = template + JSON.stringify(modules.parentModules) + ', [' + outputModules + '])'

  fs.writeFileSync(path.resolve(config.output.dirname, fileName), outputFile)
  console.log('Finished writing to bundle', path.resolve(config.output.dirname, fileName))
}

module.exports = createBundle