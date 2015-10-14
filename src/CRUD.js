import intersect from 'intersect'
import isObject from 'is-object'
import storage from './storage.js'
import StorageDriver from './StorageDriver.js'

/**
 * Represents a database
 * @constructor
 * @param {Object} conf - the options to pass to the constructor
 */
class Database {
  constructor (conf = {}) {
    this.conf = Object.assign({
      name: 'database',
      indexedKeys: [],
      uniqueKey: 'id',
      driver: new StorageDriver({
        name: conf.name,
        storage: storage
      })
    }, conf)

    this.initialize()
  }

  /**
   * Initialization method
   * @private
   */
  initialize () {
    this.data = this.load() || []
    this.id = 0

    if (this.data.length > 0) {
      this.data = this.data.map(Number)
      this.id = Math.max(...this.data)
    }
  }

  /**
   * Finding entries
   * @param   {Object} obj - the object of properties/values to look for
   * @returns {Array}      - collection of items matching the search
   */
  find (obj) {
    // If no search object is being passed, search all entries
    if (typeof obj === 'undefined') {
      return this.findAll()
    }

    // Grab the indexed and unindexed keys from search object
    const keys = this.getKeys(obj)

    let collection
    let filtered = Object.keys(keys.indexed).map(prop =>
      this.conf.driver.getItem(prop + ':' + keys.indexed[prop]) || false
    )

    if (filtered.length === 0) {
      collection = this.data
    } else if (filtered.length === 1) {
      collection = filtered[0]
    } else {
      collection = intersect(...filtered)
    }

    // Filtering by unindexed keys
    return this.filter(this.select(collection), keys.unindexed)
  }

  /**
   * Returning all entries from database
   * @returns {Array} - collection of entries
   */
  findAll () {
    return this.select(this.data)
  }

  /**
   * Dissociate indexed from unindexed keys from an object
   * @param   {Object} obj - object to parse
   * @returns {Array}      - array of indexed keys and unindexed keys
   */
  getKeys (obj) {
    let keys = {
      indexed: {},
      unindexed: {}
    }

    for (let property in obj) {
      let stack = this.conf.indexedKeys.includes(property)
          ? 'indexed'
          : 'unindexed'

      keys[stack][property] = obj[property]
    }

    return keys
  }

  /**
   * Retrieve entries from unique keys
   * @param   {Array} collection - array of unique keys
   * @returns {Array}            - array of entries
   */
  select (collection) {
    return Array.from(collection).map(::this.conf.driver.getItem)
  }

  /**
   * Filtering a collection of entries based on unindexed keys
   * @private
   * @param   {Array}  collection - array of entries to search for
   * @param   {Object} obj        - object of unindexed keys
   * @returns {Array}             - array of entries
   */
  filter (collection, obj) {
    return collection.filter(entry =>
      Object.keys(obj).every(key => entry[key] === obj[key])
    )
  }

  /**
   * Inserting an entry
   * @param   {Object} obj - document to insert
   * @returns {Number}     - unique key of the document
   */
  insert (obj) {
    if (!isObject(obj)) {
      throw new Error(`Can’t insert ${obj}. Please insert object.`)
    }

    this.id++

    if (!this.data.includes(this.id)) {
      let entry = Object.assign({}, obj, {
        [this.conf.uniqueKey]: this.id
      })
      this.data.push(this.id)
      this.conf.driver.setItem(this.id, entry)
      this.conf.driver.setItem('__data', this.data.join(','))
      this.buildIndex(entry)

      return this.id
    }
  }

  /**
   * Updating an entry
   * @param   {Number} id  - unique key of the document to update
   * @param   {Object} obj - new entry
   * @returns {Object}     - object (obj)
   */
  update (id, obj) {
    if (this.data.includes(id)) {
      this.destroyIndex(id) // First destroy existing index for object
      obj[this.conf.uniqueKey] = id
      this.conf.driver.setItem(id, obj) // Override object
      this.buildIndex(obj) // Rebuild index

      return obj
    }
  }

  /**
   * Deleting an entry
   * @param  {Number|Object} arg - unique ID or object to look for before deleting matching entries
   * @returns {Boolean}           - operation status
   */
  delete (arg) {
    // If passing an object, search and destroy
    if (isObject(arg)) {
      return this.findAndDelete(arg)
    // If passing an id, destroy id
    } else if (this.data.includes(arg)) {
      this.data.splice(this.data.indexOf(arg), 1)
      this.destroyIndex(arg)
      this.conf.driver.removeItem(arg)
      this.conf.driver.setItem('__data', this.data.join(','))

      return !this.data.includes(arg)
    }
  }

  /**
   * Find and delete
   * @private
   * @param   {Object}  obj - the object of properties/values to look for
   * @returns {Boolean}     - operation status
   */
  findAndDelete (obj) {
    const length = this.data.length

    this.find(obj).forEach(entry => this.delete(entry[this.conf.uniqueKey]))

    return this.data.length < length
  }

  /**
   * Counting number of entries
   * @returns {Number} - number of entries
   */
  count () {
    return this.data.length
  }

  /**
   * Dropping the database
   * @returns {Boolean} - operation status
   */
  drop () {
    this.data.forEach(::this.delete)
    this.conf.driver.removeItem('__data')
    this.data.length = 0

    return this.data.length === 0
  }

  /**
   * Loading entries from driver
   * @private
   * @returns {Array|null} - operation status
   */
  load () {
    let data = this.conf.driver.getItem('__data')

    return data ? data.split(',') : null
  }

  /**
   * Building the index for an entry
   * @private
   * @param {Object} obj - entry to build index of
   */
  buildIndex (obj) {
    for (let property in obj) {
      if (!this.conf.indexedKeys.includes(property)) continue

      let key = property + ':' + obj[property]
      let index = this.conf.driver.getItem(key)
      let value = [ obj[this.conf.uniqueKey] ]

      // If there is already 1 or more indexed values for this, append current
      if (index !== null) {
        index.push(obj[this.conf.uniqueKey])
        value = index
      }

      this.conf.driver.setItem(key, value)
    }
  }

  /**
   * Destroying the index for a entry
   * @private
   * @param  {Number} id - unique key of entry to destroy index for
   */
  destroyIndex (id) {
    const item = this.conf.driver.getItem(id)

    if (item === null) return

    for (let property in item) {
      if (!this.conf.indexedKeys.includes(property)) continue

      let key = property + ':' + item[property]
      let index = this.conf.driver.getItem(key)

      if (index === null) continue

      index.splice(index.indexOf(id), 1)

      if (index.length === 0) {
        this.conf.driver.removeItem(key)
      } else {
        this.conf.driver.setItem(key, index)
      }
    }
  }
}

export default Database
