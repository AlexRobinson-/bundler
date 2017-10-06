const fs = require('fs')
const path = require('path')
const babel = require('babel-core')
const createInstance = require('./lib/create-instance')

const instance = createInstance()

const babelLoader = file => babel.transform(file, { presets: ['es2015', 'react'] }).code
const jsonLoader = file => `module.exports = ${file}`
const imageLoader = (file, fileName, config) => {
  const outputPath = path.resolve(config.output.dirname, path.basename(fileName))
  fs.writeFileSync(outputPath, file, {
    encoding: 'binary'
  })
  return `module.exports = '${outputPath}'`
}

// const registerJS = someInstance => someInstance.parse(/.js$/, babelLoader)

// registerJS()

instance
  .entry('./app/app.js')

instance
  .whenEnv('development')
  .parse(/.js$/, babelLoader)

instance
  .parse(/.json$/, jsonLoader)

instance
  .parse(/.jpg/, imageLoader)

// instance
//   .whenEnv('development')
//   .parse(/.js$/, babelLoader)

instance
  .build('./dist', './test-2.js')

// const config = {
//   entry: './file-1.js',
//   output: './test.js',
//   loaders: [
//     {
//       match: /.js$/,
//       loader: babelLoader
//     },
//     {
//       match: /.json$/,
//       loader: jsonLoader
//     }
//   ]
// }

// instance.buildFromConfig(config)