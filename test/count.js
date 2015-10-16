/* global describe, it */
import { assert } from 'chai'
import Database from '../src/CRUD.js'

let db = new Database()

describe('Database `count()` function', () => {
  it('should return the number of existing entries', () => {
    let count = db.count()
    db.insert({ foo: 'bar' })

    assert(count === 0)
    assert(db.count() === 1)
    assert(db.count() === db.data.length)
  })
})
