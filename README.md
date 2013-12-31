## A CRUD JavaScript Class

Here is a [CRUD](http://en.wikipedia.org/wiki/Create,_read,_update_and_delete) JavaScript class mapping to the storage driver of your choice ([localStorage](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage) in this demo). Before going any further, a couple of things you should note:

**Each record has to be an object**. You can't store an array, a primitive or whatever; only objects. If you want to store &mdash; let's say &mdash; numbers you should wrap them into objects first; e.g. `{ value: 42 }`.

**You shouldn't try to store different entities in the same database**. The API being quite simple, it aims at solving simple issues. For a more robust JS Database, I suggest you try [Taffy](http://www.taffydb.com/).

## What is the driver?

The driver (the thing that actually does the storage) has been externalized from the main class in order to allow you to use the driver you want: `sessionStorage`, `localStorage`, `Redis`... Anything you want as long as it relies on `key/value` pairs and supports 3 methods: `setItem`, `getItem`, `removeItem`.

The one used per default is a `StorageDriver`, relying on either `localStorage` or `sessionStorage`, depending on what you pass to the constructor, but you could definitely build your own.

## How does it work?

### Instanciating a database

The `indexedKeys` property aims at speeding up the search. By setting some keys to be indexed, searching for those keys will be way faster. In any case, you can search for any key, even those which are not indexed.

    var db = new Database({
      name: 'MyDatabase',
      indexedKeys: ['job', 'age']
    })

### Inserting a new entry

    var obj = {
      name: 'Hugo',
      age: 22,
      job: 'dev'
    }

    var id = db.insert(obj)

### Updating an entry

If you want to update a specific entry, the easiest way is to pass its ID as the first argument. The ID is being added to the entry when inserted as the `id` property. You can change the name of this property by setting the `uniqueKey` option when instanciating the database.

    obj['mood'] = 'happy'
    db.update(id, obj)

To update a collection of entry based on a search, here is how you would do it:

    var dev, i, len,
        devs = this.find({ job: 'dev' })

    for(i = 0, len = devs.length; i < len; i++) {
      dev = devs[i]
      dev['mood'] = 'happy'
      dev.job = 'clown'
      db.update(dev.id, dev)
    }

### Retrieving entries

The `find` method requires an object to parse and search with.

    db.find({ mood: 'happy' })
    db.find({ job: 'dev', age: 22 })

### Retrieving all entries

You can either call the `findAll` method which returns all existing values in the database:

    db.findAll()

Or you can call the `find` method with no arguments, which basically does the same thing:

    db.find()

### Deleting an entry

If you want to delete a specific entry, the easiest way is to pass its ID to the function. The ID is being added to the entry when inserted as the `id` property. You can change the name of this property by setting the `uniqueKey` option when instanciating the database.

    db.delete(id)

If you want to delete a collection of entries based on asearch, you can pass an object to the function. The function will first perform a find, then delete all the returned entries.

    db.delete({ job: dev })

## To do

* Add `limit`, `sort` and other cool operations.
* I'd like to do something like MongoDB for the update. Not great for now.
