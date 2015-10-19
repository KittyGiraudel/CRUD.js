/* global describe, it */
import assert from 'assert'
import Database from '../src/CRUD.js'

let db = new Database()
db.drop()

describe('Database `delete()` function', () => {
  it('should remove the existing entry mapped to given id', () => {
    let a = { foo: 'bar' }
    let deletion = db.delete(db.insert(a))

    assert(db.data.length === 0)
    assert(db.find(a).length === 0)
    assert(deletion === true)
  })

  it('should remove existing entries matching given object', () => {
    let a = { foo: 'bar' }
    let b = { baz: 'qux' }
    db.insert([a, b, a, b, a, b])
    let deletion = db.delete(a)

    assert(db.data.length === 3)
    assert(db.find(a).length === 0)
    assert(deletion === true)
  })

  it('should do nothing when trying to remove a non-existing entry', () => {
    assert(typeof db.delete(42) === 'undefined')
  })

  it('should delete all existing entries when passing an empty object', () => {
    assert(db.delete({}) === true)
  })
})
