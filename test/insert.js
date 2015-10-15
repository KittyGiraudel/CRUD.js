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
    assert.throw(db.insert.bind(db, 42), Error, 'Can’t insert 42. Please insert object.')
    assert.throw(db.insert.bind(db, [4, 2]), Error, 'Can’t insert 4,2. Please insert object.')
    assert.throw(db.insert.bind(db, true), Error, 'Can’t insert true. Please insert object.')
    assert.throw(db.insert.bind(db, null), Error, 'Can’t insert null. Please insert object.')
    assert.throw(db.insert.bind(db, undefined), Error, 'Can’t insert undefined. Please insert object.')
    assert.throw(db.insert.bind(db, 'Hello world'), Error, 'Can’t insert Hello world. Please insert object.')
  })
})
