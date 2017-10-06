if (typeof process === "undefined") {
  process = {
    env: {
      NODE_ENV: 'development'
    }
  };
}

window.applyUpdate = (function (parentModules, modules) {
  const initialisedModules = {}

  const _require = (index, forceLoad = false) => {
    if (initialisedModules[index] && !forceLoad) {
      console.log('already loaded module', index)
      return initialisedModules[index]
    }

    const module = {
      exports: {}
    };

    console.log('Loading in module', index)
    modules[index](_require, module, module.exports)

    initialisedModules[index] = module.exports

    console.log('Result', initialisedModules[index])

    return initialisedModules[index]
  }

  _require(0)

  return applyUpdate = function (id, someModule) {
    console.log('Applying hot update to module', id, someModule)
    modules[id] = someModule

    if (initialisedModules[id]) {
      _require(id, true)
    } else {
      console.log('module not initialised')
    }

    (parentModules[id] || []).forEach(parentId => {
      _require(+parentId, true)
    })
  }
})(