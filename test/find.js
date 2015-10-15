/* global describe, it */
import { assert } from 'chai'
import Database from '../src/CRUD.js'

let db = new Database()

describe('Database `find()` function', () => {
  it('should return an existing entries matching given object', () => {
    let a = { foo: 'bar' }
    let b = { foo: 'baz' }
    db.insert([a, b, b])
    let findA = db.find(a)
    let findB = db.find(b)

    assert(findA.length === 1)
    assert(findA[0].foo === 'bar')
    assert(findB.length === 2)
    assert(findB[1].foo === 'baz')
  })

  it('should return all existing entries when no argument is given', () => {
    assert(db.find().length === 3)
    assert(db.find()[0].foo === 'bar')
  })

  it('should return all existing entries when passing an empty object', () => {
    assert(db.find({}).length === 3)
    assert(db.find({})[0].foo === 'bar')
  })
})
