(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helperJs = require('./helper.js');

var _StorageDriverJs = require('./StorageDriver.js');

var _StorageDriverJs2 = _interopRequireDefault(_StorageDriverJs);

/**
 * Represents a database
 * @constructor
 * @param {Object} conf - the options to pass to the constructor
 */
var Database = function Database(conf) {
  this.conf = (0, _helperJs.extend)({
    name: 'database',
    indexedKeys: [],
    uniqueKey: 'id',
    driver: new _StorageDriverJs2['default']({
      name: conf.name,
      storage: _helperJs.storage
    })
  }, conf || {});

  this.initialize();
};

/**
 * Initialization method
 * @private
 */
Database.prototype.initialize = function () {
  this.data = this.load() || [];
  this.id = 0;

  if (this.data.length > 0) {
    this.data = this.data.map(function (e) {
      return parseInt(e, 10);
    });
    this.id = Math.max.apply(Math, this.data);
  }
};

/**
 * Finding entries
 * @param   {Object} obj - the object of properties/values to look for
 * @returns {Array}      - collection of items matching the search
 */
Database.prototype.find = function (obj) {
  if (typeof obj === 'undefined') {
    return this.findAll();
  }

  var keys = this.getKeys(obj);
  var filtered = [];
  var collection = undefined;

  for (var property in keys.indexed) {
    filtered.push(this.conf.driver.getItem(property + ':' + keys[0][property]) || false);
  }

  if (filtered.length === 0) {
    collection = this.data;
  } else if (filtered.length === 1) {
    collection = filtered[0];
  } else {
    collection = _helperJs.intersect.apply(this, filtered);
  }

  // Filtering by unindexed keys
  return this.filter(this.select(collection), keys.unindexed);
};

/**
 * Returning all entries from database
 * @returns {Array} - collection of entries
 */
Database.prototype.findAll = function () {
  return this.select(this.data);
};

/**
 * Dissociate indexed from unindexed keys from an object
 * @param   {Object} obj - object to parse
 * @returns {Array}      - array of indexed keys and unindexed keys
 */
Database.prototype.getKeys = function (obj) {
  var keys = {
    indexed: {},
    unindexed: {}
  };

  for (var property in obj) {
    var stack = this.conf.indexedKeys.indexOf(property) !== -1 ? 'indexed' : 'unindexed';

    keys[stack][property] = obj[property];
  }

  return keys;
};

/**
 * Retrieve entries from unique keys
 * @param   {Array} collection - array of unique keys
 * @returns {Array}            - array of entries
 */
Database.prototype.select = function (collection) {
  var _this = this;

  collection = !Array.isArray(collection) ? [collection] : collection;

  return collection.map(function (item) {
    return _this.conf.driver.getItem(item);
  });
};

/**
 * Filtering a collection of entries based on unindexed keys
 * @private
 * @param   {Array}  collection    - array of entries to search for
 * @param   {Object} unindexedKeys - object of unindexed keys
 * @returns {Array}                - array of entries
 */
Database.prototype.filter = function (collection, unindexedKeys) {
  return collection.map(function (entry) {
    for (var property in unindexedKeys) {
      if (entry[property] !== unindexedKeys[property]) {
        return false;
      }
    }

    return entry;
  }).filter(function (entry) {
    return entry;
  });
};

/**
 * Inserting an entry
 * @param   {Object} obj - document to insert
 * @returns {Number}     - unique key of the document
 */
Database.prototype.insert = function (obj) {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error('Can\'t insert ' + obj + '. Please insert object.');
  }

  this.id++;

  if (this.data.indexOf(this.id) === -1) {
    obj[this.conf.uniqueKey] = this.id;
    this.data.push(this.id);
    this.conf.driver.setItem(this.id, obj);
    this.conf.driver.setItem('__data', this.data.join(','));
    this.buildIndex(obj);

    return this.id;
  }
};

/**
 * Updating an entry
 * @param   {Number} id  - unique key of the document to update
 * @param   {Object} obj - new entry
 * @returns {Object}     - object (obj)
 */
Database.prototype.update = function (id, obj) {
  if (this.data.indexOf(id) !== -1) {
    this.destroyIndex(id); // First destroy existing index for object
    obj[this.conf.uniqueKey] = id;
    this.conf.driver.setItem(id, obj); // Override object
    this.buildIndex(obj); // Rebuild index

    return obj;
  }
};

/**
 * Deleting an entry
 * @param  {Number|Object} arg - unique ID or object to look for before deleting matching entries
 * @returns {Boolean}           - operation status
 */
Database.prototype['delete'] = function (arg) {
  // If passing an object, search and destroy
  if (typeof arg === 'object' && arg !== null) {
    this.findAndDelete(arg);
    // If passing an id, destroy id
  } else if (this.data.indexOf(arg) !== -1) {
      this.data.splice(this.data.indexOf(arg), 1);
      this.destroyIndex(arg);
      this.conf.driver.removeItem(arg);
      this.conf.driver.setItem('__data', this.data.join(','));

      return this.data.indexOf(arg) === -1;
    }
};

/**
 * Find and delete
 * @private
 * @param   {Object}  obj - the object of properties/values to look for
 * @returns {Boolean}     - operation status
 */
Database.prototype.findAndDelete = function (obj) {
  var entries = this.find(obj);
  var length = this.data.length;

  for (var i = 0; i < entries.length; i++) {
    var id = entries[i][this.conf.uniqueKey];

    if (this.data.indexOf(id) !== -1) {
      this.data.splice(this.data.indexOf(id), 1);
      this.destroyIndex(id);
      this.conf.driver.removeItem(id);
      this.conf.driver.setItem('__data', this.data.join(','));
    }
  }

  return this.data.length < length;
};

/**
 * Counting number of entries
 * @returns {Number} - number of entries
 */
Database.prototype.count = function () {
  return this.data.length;
};

/**
 * Dropping the database
 * @returns {Boolean} - operation status
 */
Database.prototype.drop = function () {
  var _this2 = this;

  this.data.forEach(function (item) {
    return _this2['delete'](item);
  });
  this.conf.driver.removeItem('__data');
  this.data.length = 0;

  return this.data.length === 0;
};

/**
 * Loading entries from driver
 * @private
 * @returns {Array|null} - operation status
 */
Database.prototype.load = function () {
  return this.conf.driver.getItem('__data') ? this.conf.driver.getItem('__data').split(',') : null;
};

/**
 * Building the index for an entry
 * @private
 * @param {Object} obj - entry to build index of
 */
Database.prototype.buildIndex = function (obj) {
  for (var property in obj) {
    if (this.conf.indexedKeys.indexOf(property) !== -1) {
      var value = [obj[this.conf.uniqueKey]];
      var key = property + ':' + obj[property];
      var index = this.conf.driver.getItem(key);

      if (index !== null) {
        index.push(obj[this.conf.uniqueKey]);
        value = index;
      }

      this.conf.driver.setItem(key, value);
    }
  }
};

/**
 * Destroying the index for a entry
 * @private
 * @param  {Number} id - unique key of entry to destroy index for
 */
Database.prototype.destroyIndex = function (id) {
  var item = this.conf.driver.getItem(id);

  if (item === null) {
    return;
  }

  for (var property in item) {
    if (this.conf.indexedKeys.indexOf(property) === -1) {
      continue;
    }

    var key = property + ':' + item[property];
    var index = this.conf.driver.getItem(key);

    if (index === null) {
      continue;
    }

    index.splice(index.indexOf(id), 1);

    if (index.length === 0) {
      this.conf.driver.removeItem(key);
    } else {
      this.conf.driver.setItem(key, index);
    }
  }
};

module.exports = Database;

},{"./StorageDriver.js":2,"./helper.js":3}],2:[function(require,module,exports){
'use strict';

var StorageDriver = function StorageDriver(conf) {
  this.conf = conf || {};

  if (typeof this.conf.storage.getItem !== 'function' || typeof this.conf.storage.removeItem !== 'function' || typeof this.conf.storage.setItem !== 'function') {
    throw new Error('Given Storage doesn\'t have methods `getItem`, `setItem` and `removeItem`.');
  }
};

StorageDriver.prototype.setItem = function (key, value) {
  return this.conf.storage.setItem(this.conf.name + ':' + key, JSON.stringify(value));
};

StorageDriver.prototype.getItem = function (key) {
  return JSON.parse(this.conf.storage.getItem(this.conf.name + ':' + key));
};

StorageDriver.prototype.removeItem = function (key) {
  return this.conf.storage.removeItem(this.conf.name + ':' + key);
};

module.exports = StorageDriver;

},{}],3:[function(require,module,exports){
'use strict';

module.exports = {
  extend: function extend(obj, extObj) {
    obj = obj || {};
    if (arguments.length > 2) {
      for (var a = 1; a < arguments.length; a++) {
        window.extend(obj, arguments[a]);
      }
    } else {
      for (var i in extObj) {
        obj[i] = extObj[i];
      }
    }
    return obj;
  },

  intersect: function intersect() {
    var i,
        shortest,
        nShortest,
        n,
        len,
        ret = [],
        obj = {},
        nOthers;
    nOthers = arguments.length - 1;
    nShortest = arguments[0].length;
    shortest = 0;
    for (i = 0; i <= nOthers; i++) {
      n = arguments[i].length;
      if (n < nShortest) {
        shortest = i;
        nShortest = n;
      }
    }

    for (i = 0; i <= nOthers; i++) {
      n = i === shortest ? 0 : i || shortest;
      len = arguments[n].length;
      for (var j = 0; j < len; j++) {
        var elem = arguments[n][j];
        if (obj[elem] === i - 1) {
          if (i === nOthers) {
            ret.push(elem);
            obj[elem] = 0;
          } else {
            obj[elem] = i;
          }
        } else if (i === 0) {
          obj[elem] = 0;
        }
      }
    }
    return ret;
  },

  storage: function storage() {
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }

    var data = {};

    return {
      getItem: function getItem(key) {
        return data[key] || null;
      },
      setItem: function setItem(key, value) {
        data[key] = value;
      },
      removeItem: function removeItem(key) {
        delete data[key];
      }
    };
  }
};

},{}]},{},[1]);
