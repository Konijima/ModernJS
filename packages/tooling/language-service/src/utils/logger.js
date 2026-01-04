const fs = require('fs');
const path = require('path');

function log(msg) {
    try {
        fs.appendFileSync('/tmp/modernjs-language-service.log', new Date().toISOString() + ': ' + msg + '\n');
    } catch (e) {}
}

module.exports = { log };
