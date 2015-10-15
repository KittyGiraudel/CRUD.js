/* global describe, it */
import { assert } from 'chai'
import Database from '../src/CRUD.js'

let db = new Database()

describe('Database initialisation', () => {
  it('should have default configuration', () => {
    assert(typeof db.conf !== 'undefined')
    assert(db.conf.name === 'database')
    assert(db.conf.uniqueKey === 'id')
    assert(db.conf.indexedKeys.length === 0)
    assert(db._id === 0)
    assert(db._data.length === 0)
  })

  it('should grab existing entries from storage if any', () => {
    let a = { foo: 'bar' }

    db.insert(a)
    db.insert(a)
    db.insert(a)
    db.insert(a)
    db.insert(a)

    db = new Database()

    assert(db.count() === 5)
    assert(db._id === 5)
  })
})
