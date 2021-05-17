const { RadiusSingleton } = require('../radiusSingleton');
const { prepareMacAddress } = require('../prepareMacAddress');

const EnableRadiusIOTConnection = (macAddress) => {
    let radiusConnection = RadiusSingleton.getInstance().getDatabase();
    
    radiusConnection.query('INSERT INTO radcheck(username, attribute, op, value) VALUES (?, "Auth-Type",":=","Accept")', [prepareMacAddress(macAddress)], (err) => {
        if(err)
            console.log(err)
    });
}

module.exports = { EnableRadiusIOTConnection };
