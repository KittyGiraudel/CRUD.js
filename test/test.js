/* global describe, it */
import { assert } from 'chai'
import Database from '../src/CRUD.js'

let db = new Database()
beforeEach(() => db.drop());

describe('Database initialisation', () => {
  it('should have default configuration', () => {
    assert(db.conf.name === 'database')
    assert(db.conf.uniqueKey === 'id')
    assert(db.conf.indexedKeys.length === 0)
  })
})

describe('Database storage', () => {
  it('should be able to store items', () => {
    let obj = { foo: 'bar' }
    let entry = db.insert(obj)
    let next = db.insert(obj)

    assert(typeof entry === 'number')
    assert(typeof next === 'number')
    assert(entry === 1)
    assert(next === 2)
  })
})

describe('Database search', () => {
  it('should be able to find existing items', () => {
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

  it('should be able to return all existing entries', () => {
    let a = { foo: 'bar' }
    
    assert(db.findAll().length === 0)

    db.insert(a)
    db.insert(a)
    db.insert(a)

    assert(db.findAll().length === 3)
    assert(db.findAll()[0].foo === 'bar')
  })
})

describe('Database remove feature', () => {
  it('should be able to remove existing entries', () => {
    let a = { foo: 'bar' }
    let id = db.insert(a)
    db.delete(id)

    assert(db.count() === 0)
    assert(db.find(a).length === 0)
  })
})

