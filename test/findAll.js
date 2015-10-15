/* global describe, it */
import { assert } from 'chai'
import Database from '../src/CRUD.js'

let db = new Database()

describe('Database `findAll()` function', () => {
  it('should be able to return all existing entries', () => {
    let a = { foo: 'bar' }
    let len = db.findAll().length
    
    db.insert(a)
    db.insert(a)
    db.insert(a)

    assert(len === 0)
    assert(db.findAll().length === 3)
    assert(db.findAll()[0].foo === 'bar')
  })
})
