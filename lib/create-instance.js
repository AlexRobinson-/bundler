const fs = require('fs')
const createModules = require('./modules')
const createBundle = require('./create-bundle')

let emptyInstance

module.exports = () => {
  let outputFile
  let loaders = []
  let entry
  let watchFiles

  const instance = {}

  instance.entry = fileName => {
    entry = fileName
    return instance
  }

  instance.output = fileName => {
    outputFile = fileName
    return instance
  }

  instance.watch = () => {
    watchFiles = true
    return instance
  }

  instance.build = (dirname, fileName) => {
    const config = {
      entry,
      output: {
        fileName,
        dirname
      },
      loaders,
      devServer: {
        watch: Boolean(watchFiles)
      }
    }

    const modules = createModules()

    try {
      fs.mkdirSync(config.output.dirname)
    } catch (err) {
    }

    modules.registerModule(entry, config)
    createBundle(fileName || outputFile, config, modules)

    const allFiles = {}

    const registerModules = modules => {
      const uniqueModules = Object.keys(modules.modulesByRef).reduce(
        (prev, next) => {
          if (!allFiles[next]) {
            return Object.assign({}, prev, { [next]: true })
          }
          return prev
        },
        {}
      )

      Object.keys(uniqueModules).forEach(moduleFile => {
        fs.watchFile(moduleFile, watchFunction(moduleFile))
      })

      Object.assign(allFiles, uniqueModules)
    }

    const watchFunction = (changedFileName) => () => {
      console.log('File changed: ', changedFileName)
      modules.registerModule(changedFileName, config, undefined, { force: true })
      createBundle(fileName || outputFile, config, modules)
      registerModules(modules)
    }

    if (config.devServer.watch) {
      registerModules(modules)
    }
  }

  instance.parse = (match, loader) => {
    loaders.push({ match, loader })
    return instance
  }

  instance.buildFromConfig = config => {
    registerModule(config.entry, config.loaders)
    createBundle(config.output)
  }

  instance.whenEnv = testEnv => {
    if (process.env.NODE_ENV !== testEnv) {
      return emptyInstance
    }

    return instance
  }

  return instance
}

emptyInstance = module.exports()