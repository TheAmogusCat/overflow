const request = require('request')
const { getCrypto } = require('./db.js')
const {addCrypto, editCrypto} = require("./db");

module.exports = {
    async getCryptoPrice(crypto) {
        let meow = await getCrypto(crypto.toLowerCase())
        console.log(meow)
        console.log(crypto.toLowerCase())
        if (meow && (new Date() - meow.timestamp) / 1000 / 60 < 30)
            return meow.price
        else if (!meow || new Date() - meow.timestamp / 60 / 60 > 30) {
            let response = await fetch(`https://api.binance.com/api/v3/avgPrice?symbol=${crypto.toUpperCase()}USDT`)
                .then(response => response.json())
            if (!meow)
                await addCrypto({
                    name: crypto,
                    price: parseFloat(response.price),
                    timestamp: new Date()
                })
            else {
                meow.timestamp = new Date()
                await editCrypto(meow)
            }
            console.log(response)
            return response.price
        }
    }
}