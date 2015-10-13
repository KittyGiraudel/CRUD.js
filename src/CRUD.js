import { extend, intersect, storage } from './helpers.js';
import StorageDriver from './StorageDriver.js';

/**
 * Represents a database
 * @constructor
 * @param {Object} conf - the options to pass to the constructor
 */
var Database = function ( conf ) {
  this.conf = extend({
    name: 'database',
    indexedKeys: [],
    uniqueKey: 'id',
    driver: new StorageDriver({
      name: conf.name,
      storage: storage
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
    this.data = this.data.map((e) => parseInt(e, 10));
    this.id = Math.max.apply(Math, this.data);
  }
};

/**
 * Finding entries
 * @param   {Object} obj - the object of properties/values to look for
 * @returns {Array}      - collection of items matching the search
 */
Database.prototype.find = function ( obj ) {
  if (typeof obj === 'undefined') {
    return this.findAll();
  }

  const keys = this.getKeys(obj);
  let filtered = [];
  let collection;

  for (let property in keys.indexed) {
    filtered.push(this.conf.driver.getItem(property + ':' + keys[0][property]) || false);
  }

  if (filtered.length === 0) {
    collection = this.data;
  } else if (filtered.length === 1) {
    collection = filtered[0];
  } else {
    collection = intersect.apply(this, filtered);
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
Database.prototype.getKeys = function ( obj ) {
  let keys = {
    indexed: {},
    unindexed: {}
  };

  for (let property in obj) {
    let stack = this.conf.indexedKeys.indexOf(property) !== -1
        ? 'indexed'
        : 'unindexed';

    keys[stack][property] = obj[property];
  }

  return keys;
};

/**
 * Retrieve entries from unique keys
 * @param   {Array} collection - array of unique keys
 * @returns {Array}            - array of entries
 */
Database.prototype.select = function ( collection ) {
  collection = !Array.isArray(collection) ? [collection] : collection;

  return collection.map((item) => this.conf.driver.getItem(item));
};

/**
 * Filtering a collection of entries based on unindexed keys
 * @private
 * @param   {Array}  collection    - array of entries to search for
 * @param   {Object} unindexedKeys - object of unindexed keys
 * @returns {Array}                - array of entries
 */
Database.prototype.filter = function ( collection, unindexedKeys ) {
  return collection.map((entry) => {
    for (let property in unindexedKeys) {
      if (entry[property] !== unindexedKeys[property]) {
        return false; 
      }
    }

    return entry;
  }).filter((entry) => entry);
};

/**
 * Inserting an entry
 * @param   {Object} obj - document to insert
 * @returns {Number}     - unique key of the document
 */
Database.prototype.insert = function ( obj ) {
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
Database.prototype.update = function ( id, obj ) {
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
Database.prototype.delete = function ( arg ) {
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
Database.prototype.findAndDelete = function ( obj ) {
  const entries = this.find(obj);
  const length = this.data.length;

  for (let i = 0; i < entries.length; i++) {
    let id = entries[i][this.conf.uniqueKey];

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
  this.data.forEach((item) => this.delete(item));
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
  return this.conf.driver.getItem('__data') ?
    this.conf.driver.getItem('__data').split(',') :
    null;
};

/**
 * Building the index for an entry
 * @private
 * @param {Object} obj - entry to build index of
 */
Database.prototype.buildIndex = function ( obj ) {
  for (let property in obj) {
    if (this.conf.indexedKeys.indexOf(property) !== -1) {
      let value = [obj[this.conf.uniqueKey]];
      let key = property + ':' + obj[property];
      let index = this.conf.driver.getItem(key);

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
Database.prototype.destroyIndex = function ( id ) {
  const item = this.conf.driver.getItem(id);

  if (item === null) {
    return;
  }

  for (let property in item) {
    if (this.conf.indexedKeys.indexOf(property) === -1) {
      continue;
    }

    let key = property + ':' + item[property];
    let index = this.conf.driver.getItem(key);

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
