const fs = require('node:fs')

function getApplications() {
    let content = fs.readFileSync(__dirname + '/applications.json')
    return JSON.parse(content)
}

module.exports = {
    async addApplication(application) {
        let content = getApplications()
        content.push(application)
        fs.writeFileSync(__dirname + '/applications.json', JSON.stringify(content, null, 2))
    },
    async getApplications() {
        let content = fs.readFileSync(__dirname + '/applications.json')
        return JSON.parse(content)
    },
    async getApplication(application) {
        let content = getApplications()
        return content.find(a => a.author === application)
    },
    async getApplicationByMessageId(application) {
        let content = getApplications()
        return content.find(a => a.messageId === application)
    },
    async editApplication(applicationId, newApplication) {
        let content = getApplications()
        content.splice(content.indexOf(content.find(a => a.author === applicationId)), 1)
        content.push(newApplication)
        fs.writeFileSync(__dirname + '/applications.json', JSON.stringify(content, null, 2))
    },
    async deleteApplication(applicationId) {
        let content = getApplications()
        content.splice(content.indexOf(content.find(a => a.author === applicationId)), 1)
        fs.writeFileSync(__dirname + '/applications.json', JSON.stringify(content, null, 2))
    },
    async getId() {
        let content = getApplications()
        let id = content.length + 1
        return id.toString()
    },
    async addCode(code, receiver) {
        let content = JSON.parse(fs.readFileSync(__dirname + '/codes.json'))
        content.push({ code: code, receiver: receiver })
        fs.writeFileSync(__dirname + '/codes.json', JSON.stringify(content, null, 2))
    },
    async getCode(code) {
        let content = JSON.parse(fs.readFileSync(__dirname + '/codes.json'))
        return content.find(a => a.code === code)
    },
    async getCodeByReceiver(receiver) {
        let content = JSON.parse(fs.readFileSync(__dirname + '/codes.json'))
        return content.find(a => a.receiver === receiver)
    },
    async removeCode(code) {
        let content = JSON.parse(fs.readFileSync(__dirname + '/codes.json'))
        content.splice(content.indexOf(content.find(a => a.code === code)), 1)
        fs.writeFileSync(__dirname + '/codes.json', JSON.stringify(content, null, 2))
    }
}