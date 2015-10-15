/* global describe, it */
import { assert } from 'chai'
import Database from '../src/CRUD.js'

let db = new Database()

describe('Database `delete()` function', () => {
  it('should be able to remove existing entries from ID', () => {
    let a = { foo: 'bar' }
    let deletion = db.delete(db.insert(a))

    assert(db.data.length === 0)
    assert(db.find(a).length === 0)
    assert(deletion === true)
  })

  it('should be able to remove existing entries from object', () => {
    let a = { foo: 'bar' }
    db.insert([a, a, a])
    let deletion = db.delete(a)

    assert(db.data.length === 0)
    assert(db.find(a).length === 0)
    assert(deletion === true)
  })

  it('should do nothing when trying to remove a non-existing entry', () => {
    assert(typeof db.delete(42) === 'undefined')
  })

  it('should do nothing when passing an empty object', () => {
    assert(db.delete({}) === false)
  })
})
