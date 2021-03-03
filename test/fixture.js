/* global describe, it */
import assert from 'assert'
import Database from '../src/CRUD.js'
import data from './fixtures/data.json'

let db = new Database()
db.drop()

// Quick helper
let searchKitty = () => db.find({ firstName: 'Kitty', lastName: 'Giraudel' })

describe('Real test feature', () => {
  it('should work', () => {
    // Initial insert
    data.forEach((item) => db.insert(item))
    assert(db.count() === data.length)

    // Find developers
    let developers = db.find({ job: 'Developer' })
    assert(developers.length === 4)

    // Find Kitty
    let search = searchKitty()
    let Kitty = search[0]
    assert(search.length === 1)
    assert(search[0].firstName === 'Kitty')
    assert(search[0].lastName === 'Giraudel')

    // Update Kitty
    let update = db.update(Kitty[db.conf.uniqueKey], Object.assign(Kitty, {
      job: 'Front-end developer'
    }))
    assert(update.job === Kitty.job)

    // Check Kitty
    assert(searchKitty()[0].job === 'Front-end developer')

    // Delete Kitty
    db.delete(Kitty[db.conf.uniqueKey])
    assert(searchKitty().length === 0)

    // Insert Kitty back
    db.insert(Kitty)
    search = searchKitty()
    assert(search.length === 1)
    assert(search[0].job === 'Front-end developer')
  })
})
