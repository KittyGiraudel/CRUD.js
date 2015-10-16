/* global describe, it */
import { assert } from 'chai'
import Database from '../src/CRUD.js'

let db = new Database()

describe('Database `update()` function', () => {
  it('should update an existing entry from given id and object', () => {
    let obj = { foo: 'bar' }
    let id = db.insert(obj)
    let entry = db.update(id, Object.assign(obj, { baz: 'qux' }))

    assert(id === entry.id)
    assert(typeof entry === 'object')
    assert(entry.foo === 'bar')
    assert(entry.baz === 'qux')
  })

  it('should do nothing when trying to update a non-existing entry', () => {
    assert(typeof db.update(42, { baz: 'qux' }) === 'undefined')
  })
})
