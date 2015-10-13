module.exports = {
  extend: extend,
  intersect: intersect,
  storage: storage(),
};

function extend( obj, extObj ) {
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
}

function intersect() {
  var i, shortest, nShortest, n, len, ret = [], obj = {}, nOthers;
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
    n = (i === shortest) ? 0 : (i || shortest);
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
}

function storage() {
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
}
