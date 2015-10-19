/* global describe, it */
import assert from 'assert'
import Database from '../src/CRUD.js'
import data from './fixtures/data.json'

let db = new Database()
db.drop()

// Quick helper
let searchHugo = () => db.find({ firstName: 'Hugo', lastName: 'Giraudel' })

describe('Real test feature', () => {
  it('should work', () => {
    // Initial insert
    data.forEach((item) => db.insert(item))
    assert(db.count() === data.length)

    // Find developers
    let developers = db.find({ job: 'Developer' })
    assert(developers.length === 4)

    // Find Hugo
    let search = searchHugo()
    let Hugo = search[0]
    assert(search.length === 1)
    assert(search[0].firstName === 'Hugo')
    assert(search[0].lastName === 'Giraudel')

    // Update Hugo
    let update = db.update(Hugo[db.conf.uniqueKey], Object.assign(Hugo, {
      job: 'Front-end developer'
    }))
    assert(update.job === Hugo.job)

    // Check Hugo
    assert(searchHugo()[0].job === 'Front-end developer')

    // Delete Hugo
    db.delete(Hugo[db.conf.uniqueKey])
    assert(searchHugo().length === 0)

    // Insert Hugo back
    db.insert(Hugo)
    search = searchHugo()
    assert(search.length === 1)
    assert(search[0].job === 'Front-end developer')
  })
})
