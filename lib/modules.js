const fs = require('fs')
const path = require('path')
const acorn = require('acorn')
const walk = require('acorn/dist/walk')
const escodegen = require('escodegen')
const babel = require('babel-core')
const astring = require('astring')

const createInstance = () => {
  let current = 0

  const modules = {}
  const modulesByRef = {}
  const parentModules = {}

  const addJsExtension = fileName => {
    if (path.extname(fileName) !== '') {
      return fileName
    }

    return fileName + '.js'
  }

  const registerModule = (fileName, config, requiringModule, registerConfig = {}) => {
    const isRelative = fileName.match(/^(\.|\/)/) !== null

    let absoluteFilePath

    if (isRelative) {
      fileName = addJsExtension(fileName)

      absoluteFilePath = requiringModule ? path.resolve(path.dirname(requiringModule), fileName) : fileName
    } else {
      const moduleFolder = path.resolve(path.dirname(require.main.filename), 'node_modules', fileName)

      if (path.extname(fileName) === '' && !fs.existsSync(addJsExtension(moduleFolder))) {
        // If loading in main file from module
        const packageJson = JSON.parse(fs.readFileSync(path.resolve(moduleFolder, 'package.json')).toString())
        absoluteFilePath = path.resolve(moduleFolder, packageJson.main || 'index.js')
      } else {

        // If loading in specific file from modules directory
        absoluteFilePath = addJsExtension(moduleFolder)
      }
    }

    // Check if we have already loaded in this module
    if (modulesByRef[absoluteFilePath] && !registerConfig.force) {
      return modulesByRef[absoluteFilePath]
    }

    console.log('Bundling in file', absoluteFilePath)

    // Generate the id for the module
    const next = registerConfig.force ? modulesByRef[absoluteFilePath] : current++

    // Add module to lookup so we can easily see if it has already been loaded
    modulesByRef[absoluteFilePath] = next
    parentModules[next] = []

    const rawFile = fs.readFileSync(absoluteFilePath)

    // Find the loader for the module's file type
    const matched = config.loaders.find(loader => new RegExp(loader.match).test(fileName)) || { loader: file => file }

    // At the moment, only pass relative files through loaders
    const file = isRelative ? matched.loader(rawFile, fileName, config) : rawFile

    let tree

    try {
      tree = acorn.parse(file)
    } catch (err) {
      console.error(`Failed loading module ${fileName} #${next}`)
      console.error(file)
      console.error(err)
      return next
    }

    const isRequire = node => node.callee && node.callee.type === 'Identifier' && node.callee.name === 'require'

    walk.simple(tree, {
      Literal(node) {
        // console.log(`Found a literal: ${node.value}`)
      },

      CallExpression(node) {
        // For each require function we find, register the module and replace the module path with the module's id
        if (isRequire(node)) {
          const value = registerModule(node.arguments[0].value, config, absoluteFilePath)
          node.arguments[0].value = node.arguments[0].raw = value

          parentModules[value].push(next)
        }
      }
    })

    modules[next] = astring.generate(tree)

    return next
  }

  return {
    modules,
    getModules: () => modules,
    registerModule,
    modulesByRef,
    parentModules
  }
}

module.exports = createInstance