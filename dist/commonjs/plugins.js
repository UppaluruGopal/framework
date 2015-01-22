"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var _interopRequireWildcard = function (obj) {
  return obj && obj.constructor === Object ? obj : {
    "default": obj
  };
};

var LogManager = _interopRequireWildcard(require("aurelia-logging"));

var Metadata = require("aurelia-metadata").Metadata;


var logger = LogManager.getLogger("aurelia");

function loadPlugin(aurelia, loader, info) {
  logger.debug("Loading plugin " + info.moduleId + ".");

  aurelia.currentPluginId = info.moduleId;

  return loader.loadModule(info.moduleId, "").then(function (exportedValue) {
    if ("install" in exportedValue) {
      var result = exportedValue.install(aurelia, info.config || {});

      if (result) {
        return result.then(function () {
          aurelia.currentPluginId = null;
          logger.debug("Installed plugin " + info.moduleId + ".");
        });
      } else {
        logger.debug("Installed plugin " + info.moduleId + ".");
      }
    } else {
      logger.debug("Loaded plugin " + info.moduleId + ".");
    }

    aurelia.currentPluginId = null;
  });
}

var Plugins = (function () {
  function Plugins(aurelia) {
    this.aurelia = aurelia;
    this.info = [];
    this.processed = false;
  }

  _prototypeProperties(Plugins, null, {
    plugin: {
      value: function plugin(moduleId, config) {
        var plugin = { moduleId: moduleId, config: config || {} };

        if (this.processed) {
          loadPlugin(this.aurelia, this.aurelia.loader, plugin);
        } else {
          this.info.push(plugin);
        }

        return this;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    es5: {
      value: function es5() {
        Function.prototype.computed = function (computedProperties) {
          for (var key in computedProperties) {
            if (computedProperties.hasOwnProperty(key)) {
              Object.defineProperty(this.prototype, key, { get: prop[key], enumerable: true });
            }
          }
        };
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    atscript: {
      value: function atscript() {
        this.aurelia.container.supportAtScript();
        Metadata.configure.location("annotate");
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _process: {
      value: function Process() {
        var _this = this;
        var aurelia = this.aurelia,
            loader = aurelia.loader,
            info = this.info,
            current;

        if (this.processed) {
          return;
        }

        var next = function () {
          if (current = info.shift()) {
            return loadPlugin(aurelia, loader, current).then(next);
          }

          _this.processed = true;
          return Promise.resolve();
        };

        return next();
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return Plugins;
})();

exports.Plugins = Plugins;