/* global localStorage */
let data = {}

export default (typeof localStorage !== 'undefined') ? localStorage : {
  getItem: key => data[key] || null,
  setItem: (key, value) => data[key] = value,
  removeItem: key => delete data[key]
}
