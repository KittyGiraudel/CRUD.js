let data = {};

export default (typeof localStorage !== 'undefined') ? localStorage : {
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
