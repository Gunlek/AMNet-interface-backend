const { replaceAll } = require('./replaceAll');

const prepareMacAddress = (macAddress) => {
    return replaceAll(replaceAll(replaceAll(macAddress, '-', ''), ':',''), ' ', '').toUpperCase();
}

module.exports = { prepareMacAddress };