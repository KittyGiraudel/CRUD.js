module.exports = (function storage() {
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }

  var data = {};

  return {
    getItem: function (key) {
      return data[key] || null;
    },
    setItem: function (key, value) {
      data[key] = value;
    },
    removeItem: function (key) {
      delete data[key];
    }
  };
}());
