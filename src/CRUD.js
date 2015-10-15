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
      // Name of the database
      name: 'database',
      // Indexed keys used for speed search
      indexedKeys: [],
      // Auto-generated unique key added to all entries
      uniqueKey: 'id',
      // Verbose mode
      verbose: false,
      // Driver used for storage
      driver: new StorageDriver({
        name: conf.name,
        storage: storage
      })
    }, conf)

    this._initialize()
  }

  /**
   * Initialization method
   * @private
   */
  _initialize () {
    // Load existing entries
    this.data = this._load()
    // Set internal id
    this.id = Math.max(...this.data, 0)
  }

  /**
   * Finding entries
   * @param   {Object} obj - the object of properties/values to look for
   * @returns {Array}      - collection of items matching the search
   */
  find (obj = {}) {
    // Grab the indexed and unindexed keys from search object
    let keys = {
      indexed: {},
      unindexed: {}
    }

    for (let property in obj) {
      let stack = this.conf.indexedKeys.includes(property) ? 'indexed' : 'unindexed'
      keys[stack][property] = obj[property]
    }

    let results = Object.keys(keys.indexed).map(prop =>
      this.conf.driver.getItem(prop + ':' + keys.indexed[prop])
    )

    let collection = !results.length
      ? this.data
      : results.length === 1
        ? results
        : intersect(...results)

    // Filtering by unindexed keys
    return collection.map(::this.conf.driver.getItem).filter(entry =>
      Object.keys(keys.unindexed).every(key =>
        entry[key] === keys.unindexed[key]
      )
    )
  }

  /**
   * Inserting an entry
   * @param   {Array|Object} arg - entry or array of entries to insert
   * @returns {Number}           - unique key of the document
   */
  insert (arg) {
    // Go recursive if it is an array, inserting several entries at once
    if (Array.isArray(arg)) {
      return arg.forEach(::this.insert)
    }

    // If it is not an object, throw an error as it is not storable
    if (!isObject(arg)) {
      throw new Error(`Can’t insert ${arg}. Please insert object.`)
    }

    // Bump up unique key
    this.id++

    // If it exists already (shouldn’t), abort
    if (this.data.includes(this.id)) {
      return this._log(`Existing entry for ${this.id}. Aborting.`)
    }

    // Clone object and assign it unique key
    let entry = Object.assign({}, arg, {
      [this.conf.uniqueKey]: this.id
    })

    // Push object to data storage
    this.data.push(this.id)
    this.conf.driver.setItem(this.id, entry)
    this.conf.driver.setItem('__data', this.data.join(','))

    // Rebuild index if necessary
    this._buildIndex(entry)

    // Return newly generated unique key
    return this.id
  }

  /**
   * Updating an entry
   * @param   {Number} id  - unique key of the document to update
   * @param   {Object} obj - new entry
   * @returns {Object}     - object (obj)
   */
  update (id, obj) {
    // If there is an existing entry for `id`
    if (this.data.includes(id)) {
      // Clone object and assign it unique key
      let entry = Object.assign({}, obj, {
        [this.conf.uniqueKey]: id
      })

      // First destroy existing index for object
      this._destroyIndex(id)
      // Override object to data storage
      this.conf.driver.setItem(id, obj)
      // Rebuild index if necessary
      this._buildIndex(obj)

      // Return new object
      return entry
    }

    this._log(`No entry found for ${id}.`)
  }

  /**
   * Deleting an entry
   * @param  {Number|Object} arg - unique ID or object to look for before deleting matching entries
   * @returns {Boolean}          - operation status
   */
  delete (arg) {
    // If passing an object, search and destroy
    if (isObject(arg)) {
      return this._findAndDelete(arg)
    // If passing an id, destroy id
    } else if (this.data.includes(arg)) {
      // Remove id from storage
      this.data.splice(this.data.indexOf(arg), 1)
      // Remove entry from storage
      this.conf.driver.removeItem(arg)
      this.conf.driver.setItem('__data', this.data.join(','))
      // Destroy index for given id
      this._destroyIndex(arg)

      // Return wether it went well
      return !this.data.includes(arg)
    }

    this._log(`No entry found for ${arg}.`)
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
    // Remove all the entries from storage
    this.data.forEach(::this.delete)
    // Remove the storage key altogether
    this.conf.driver.removeItem('__data')
    // Reset the length of data to 0
    this.data.length = 0

    return !this.data.length
  }

  /**
   * Find and delete
   * @private
   * @param   {Object}  obj - the object of properties/values to look for
   * @returns {Boolean}     - operation status
   */
  _findAndDelete (obj) {
    const length = this.data.length

    this.find(obj).forEach(entry =>
      this.delete(entry[this.conf.uniqueKey])
    )

    return this.data.length < length
  }

  /**
   * Loading entries from driver
   * @private
   * @returns {Array} - operation status
   */
  _load () {
    let data = this.conf.driver.getItem('__data')

    return data ? data.split(',').map(Number) : []
  }

  /**
   * Building the index for an entry
   * @private
   * @param {Object} obj - entry to build index of
   */
  _buildIndex (obj) {
    // For each property of entry
    for (let property in obj) {
      // If it is not an indexed key, skip to next key
      if (!this.conf.indexedKeys.includes(property)) continue

      // Grab the index for the given key
      let key = property + ':' + obj[property]
      let index = this.conf.driver.getItem(key)

      // Prepare value in case there is no index yet
      let value = [ obj[this.conf.uniqueKey] ]

      // If there is already 1 or more indexed values for this, append current
      if (index) {
        index.push(obj[this.conf.uniqueKey])
        value = index
      }

      // Update (or create) index for key
      this.conf.driver.setItem(key, value)
    }
  }

  /**
   * Destroying the index for a entry
   * @private
   * @param {Number} id - unique key of entry to destroy index for
   */
  _destroyIndex (id) {
    // Grab the entry for the given id
    const item = this.conf.driver.getItem(id)

    // If there is no entry, there is no index then abort
    if (!item) return

    // For each property of entry
    for (let property in item) {
      // If it is not an indexed key, skip to next key
      if (!this.conf.indexedKeys.includes(property)) continue

      // Grab the index for the given key
      let key = property + ':' + item[property]
      let index = this.conf.driver.getItem(key)

      // If there is no index, skip to next key
      if (!index) continue

      // Remove the entry id from the current index
      index.splice(index.indexOf(id), 1)

      // If the index is now empty, remove it from storage
      if (!index.length) {
        this.conf.driver.removeItem(key)
      // Else, update it in storage
      } else {
        this.conf.driver.setItem(key, index)
      }
    }
  }

  /**
   * Internal logging helper
   * @param  {String} message - message to display
   */
  _log (message) {
    if (this.conf.verbose && console) {
      console.log(message)
    }
  }

}

export default Database
