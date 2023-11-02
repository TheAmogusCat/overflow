const request = require('request')
const { getCrypto } = require('./db.js')
const {addCrypto, editCrypto} = require("./db");

module.exports = {
    async getCryptoPrice(crypto) {
        let meow = await getCrypto(crypto.toUpperCase() + 'USDT')
        if (meow !== undefined && new Date() - meow.timestamp / 60 / 60 < 30)
            return meow.price
        else if (meow === undefined || new Date() - meow.timestamp / 60 / 60 > 30)
            request(
                `https://api.binance.com/api/v3/avgPrice?symbol=${crypto.toUpperCase()}USDT`,
                async function(error, response, body) {
                    if (!error && response.statusCode === 200) {
                        if (meow === undefined)
                            await addCrypto({ name: crypto, price: body.price, timestamp: new Date() })
                        else {
                            meow.timestamp = new Date()
                            await editCrypto(crypto)
                        }
                        return body.price
                    }
                }
            )
    }
}