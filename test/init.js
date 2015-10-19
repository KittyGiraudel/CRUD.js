/* global describe, it */
import assert from 'assert'
import Database from '../src/CRUD.js'

let db = new Database()
db.drop()

describe('Database initialisation', () => {
  it('should have default configuration', () => {
    assert(typeof db.conf !== 'undefined')
    assert(db.conf.name === 'database')
    assert(db.conf.uniqueKey === 'id')
    assert(db.conf.indexedKeys.length === 0)
    assert(db.id === 0)
    assert(db.data.length === 0)
  })

  it('should load existing entries from storage if any', () => {
    let a = { foo: 'bar' }
    db.insert([a, a, a, a, a])
    db = new Database()

    assert(db.count() === 5)
    assert(db.id === 5)
  })
})
