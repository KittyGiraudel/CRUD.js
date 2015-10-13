var StorageDriver = function ( conf ) {
  this.conf = conf || {};

  if (
    typeof this.conf.storage.getItem !== 'function' ||
    typeof this.conf.storage.removeItem !== 'function' ||
    typeof this.conf.storage.setItem !== 'function'
  ) {
    throw new Error('Given Storage doesn\'t have methods `getItem`, `setItem` and `removeItem`.');
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

module.exports = StorageDriver;
