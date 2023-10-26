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
    async getMarketItem(item) {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            const collection = db.collection('market')
            return await collection.findOne({id: item})
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async deleteItem(item) {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            const collection = db.collection('market')
            await collection.deleteOne({id: item})
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
    },
    async addItemToShop(item) {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            let collectionName
            if (['videocard'].includes(item.item.type))
                collectionName = 'orangeShop'
            else if (['pet_supplies', 'pet'].includes(item.item.type))
                collectionName = 'greenShop'
            else
                collectionName = 'orangeShop'
            const collection = db.collection(collectionName)
            let id = await collection.count()
            await collection.insertOne({id: id, item: item.item, description: item.description, count: item.count, price: item.price})
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async getShopItems(collectionName) {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            const collection = db.collection(collectionName)
            return await collection.find().toArray()
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async getShopItem(item, collectionName) {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            const collection = db.collection(collectionName)
            return await collection.findOne({id: item})
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async getShopItemByItem(item) {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            let collectionName
            if (['videocard'].includes(item.type))
                collectionName = 'orangeShop'
            else if (['pet_supplies', 'pet'].includes(item.type))
                collectionName = 'greenShop'
            const collection = db.collection(collectionName)
            return await collection.findOne({ 'item.id': item.id })
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async editShopItem(item, newItem) {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            let collectionName
            if (['videocard'].includes(item.type))
                collectionName = 'orangeShop'
            else if (['pet_supplies', 'pet'].includes(item.type))
                collectionName = 'greenShop'
            const collection = db.collection(collectionName)
            await collection.findOneAndUpdate({'item.id': item.id}, {$set: newItem})
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async buyShopItem(item) {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            let collectionName
            if (['videocard'].includes(item.item.type))
                collectionName = 'orangeShop'
            else if (['pet_supplies', 'pet'].includes(item.item.type))
                collectionName = 'greenShop'
            const collection = db.collection(collectionName)
            let meow = await collection.findOne({ id: item.id })
            meow.count -= 1
            await collection.findOneAndUpdate({ id: item.id }, { $set: meow })
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async deleteShop(item) {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            const collection = db.collection('shop')
            await collection.deleteOne({id: item})
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async clearShop() {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            const collection = db.collection('shop')
            await collection.deleteMany({})
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async addShopInfo(info, collectionName) {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            const collection = db.collection(collectionName)
            await collection.insertOne(info)
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async editShopInfo(info, newInfo, collectionName) {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            const collection = db.collection(collectionName)
            await collection.findOneAndUpdate({ messageId: info }, { $set: newInfo })
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async getShopInfo(collectionName) {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            const collection = db.collection(collectionName)
            return await collection.findOne({id: 0})
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    },
    async getCollectionName(messageId) {
        try {
            await mongoClient.connect()
            const db = mongoClient.db('overflow')
            let collection = db.collection('orangeShop')
            if ((await collection.findOne({id: 0})).messageId === messageId)
                return 'orangeShop'
            collection = db.collection('greenShop')
            if ((await collection.findOne({id: 0})).messageId === messageId)
                return 'greenShop'
            collection = db.collection('whiteShop')
            if ((await collection.findOne({id: 0})).messageId === messageId)
                return 'whiteShop'
        } catch (e) {
            console.log(e)
        } finally {
            await mongoClient.close()
        }
    }
}