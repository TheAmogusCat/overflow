const MongoClient = require('mongodb').MongoClient

const url = 'mongodb://127.0.0.1:27017'
const mongoClient = new MongoClient(url)

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
            item['id'] = await collection.count() + 1
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
    },
    async addItemToMarket(item, author, description, price) {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            const collection = db.collection('market')
            let id = await collection.count()
            await collection.insertOne({id: id, item: item, author: author, description: description, price: price})
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async getItems() {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            const collection = db.collection('market')
            return await collection.find().toArray()
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async clearMarket() {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            const collection = db.collection('market')
            await collection.deleteMany({})
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async addMarketInfo(info) {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            const collection = db.collection('market')
            await collection.insertOne(info)
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async editMarketInfo(info, newInfo) {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            const collection = db.collection('market')
            await collection.findOneAndUpdate({ messageId: info }, { $set: newInfo })
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async getMarketInfo() {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            const collection = db.collection('market')
            return await collection.findOne({ id: 0 })
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    }
}