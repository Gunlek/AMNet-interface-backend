const { RadiusSingleton } = require('../radiusSingleton');

const EnableRadiusIOTConnection = (macAddress) => {
    let radiusConnection = RadiusSingleton.getInstance().getDatabase();
    
    radiusConnection.query('INSERT INTO radcheck(username, attribute, op, value) VALUES (?, "Auth-Type",":=","Accept")', [macAddress], (err) => {
        if(err)
            console.log(err)
    });
}

module.exports = { EnableRadiusIOTConnection };
