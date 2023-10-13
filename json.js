const fs = require('node:fs')

function getApplications() {
    let content = fs.readFileSync(__dirname + '/applications.json')
    return JSON.parse(content)
}

module.exports = {
    async addApplication(application) {
        let content = getApplications()
        content[application.id] = application
        fs.writeFileSync(__dirname + '/applications.json', JSON.stringify(content, null, 2))
    },
    async getApplication(application) {
        let content = getApplications()
        return content[application]
    },
    async getId() {
        let content = getApplications()
        let id = Object.keys(content).length + 1
        return id.toString()
    }
}