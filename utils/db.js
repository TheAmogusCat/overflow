const MongoClient = require('mongodb').MongoClient

const url = 'mongodb://127.0.0.1:27017'
const mongoClient = new MongoClient(url)

async function getUser(member) {
    try {
        await mongoClient.connect()
        const db = mongoClient.db('overflow')
        const collection = db.collection('users')
        return await collection.findOne({member: member})
    } catch (e) {
        console.log(e)
    } finally {
        await mongoClient.close()
    }
}

async function editUser(user, newUser) {
    try {
        await mongoClient.connect()
        const db = mongoClient.db('overflow')
        const collection = db.collection('users')
        await collection.findOneAndUpdate({member: user}, {$set: newUser})
    } catch (e) {
        console.log(e)
    } finally {
        await mongoClient.close()
    }
}

module.exports = {
    async getUser(member) {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            const collection = db.collection('users')
            return await collection.findOne({member: member})
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async addUser(member) {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            const collection = db.collection('users')
            await collection.insertOne(member)
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async editUser(user, newUser) {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            const collection = db.collection('users')
            await collection.findOneAndUpdate({member: user}, {$set: newUser})
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async addItem(item) {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            const collection = db.collection('items')
            console.log(collection)
            await collection.insertOne(item)
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async getItem(item, name = '') {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            const collection = db.collection('items')
            if (name === '')
                return await collection.findOne({ id: item })
            else
                return await collection.findOne({ name: name })
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    }
}