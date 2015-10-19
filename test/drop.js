/* global describe, it */
import assert from 'assert'
import Database from '../src/CRUD.js'

let db = new Database()
db.drop()

describe('Database `drop()` function', () => {
  it('should remove all existing entries', () => {
    let a = { foo: 'bar' }
    db.insert([a, a, a, a])
    let drop = db.drop()

    assert(db.count() === 0)
    assert(drop === true)
  })
})
