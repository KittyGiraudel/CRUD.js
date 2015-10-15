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
    assert(db.id === 0)
    assert(db.data.length === 0)
  })
})
