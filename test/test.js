/* global describe, it */
import { assert } from 'chai'
import Database from '../src/CRUD.js'

describe('Database init', () => {
  it('should have default configuration', () => {
    let db = new Database()

    assert(db.conf.name, 'database')
    assert(db.conf.uniqueKey, 'id')
    assert(db.conf.indexedKeys, [])
  })
})
