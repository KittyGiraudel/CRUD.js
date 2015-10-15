/* global describe, it */
import { assert } from 'chai'
import Database from '../src/CRUD.js'

let db = new Database()

describe('Database `find()` function', () => {
  it('should be able to find existing entries', () => {
    let a = { foo: 'bar' }
    let b = { foo: 'baz' }

    db.insert(a)
    db.insert(b)
    db.insert(b)

    let findA = db.find(a)
    let findB = db.find(b)

    assert(findA.length === 1)
    assert(findA[0].foo === 'bar')
    assert(findB.length === 2)
    assert(findB[1].foo === 'baz')
  })
})
