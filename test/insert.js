/* global describe, it */
import { assert } from 'chai'
import Database from '../src/CRUD.js'

let db = new Database()

describe('Database `insert()` function', () => {
  it('should be able to insert new entries', () => {
    let obj = { foo: 'bar' }
    let entry = db.insert(obj)
    let next = db.insert(obj)

    assert(typeof entry === 'number')
    assert(typeof next === 'number')
    assert(entry === 1)
    assert(next === 2)
  })

  it('should throw an error when trying to insert a non-object', () => {
    assert.throw(db.insert.bind(db, 42), Error)
    assert.throw(db.insert.bind(db, [4, 2]), Error)
    assert.throw(db.insert.bind(db, true), Error)
    assert.throw(db.insert.bind(db, null), Error)
    assert.throw(db.insert.bind(db, undefined), Error)
    assert.throw(db.insert.bind(db, 'Hello world'), Error)
  })
})
