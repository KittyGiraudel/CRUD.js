(function ( exports ) {
  'use strict';

  var StorageDriver = function ( conf ) {
    this.conf = exports.extend({
      name: '',
      storage: exports.localStorage
    }, conf || {});

    if (
      typeof conf.storage.getItem !== 'function' ||
      typeof conf.storage.removeItem !== 'function' ||
      typeof conf.storage.setItem !== 'function'
    ) {
      throw 'Given Storage doesn\'t have methods `getItem`, `setItem` and `removeItem`.';
    }
  };

  StorageDriver.prototype.setItem = function ( key, value ) {
    return this.conf.storage.setItem(this.conf.name + ':' + key, JSON.stringify(value));
  };

  StorageDriver.prototype.getItem = function ( key ) {
    return JSON.parse(this.conf.storage.getItem(this.conf.name + ':' + key));
  };

  StorageDriver.prototype.removeItem = function ( key ) {
    return this.conf.storage.removeItem(this.conf.name + ':' + key);
  };

  if (exports.Database) {
    exports.Database.drivers.StorageDriver = StorageDriver;
  }
}) ( window );
