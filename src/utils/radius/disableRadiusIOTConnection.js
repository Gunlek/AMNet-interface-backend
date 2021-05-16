const { RadiusSingleton } = require('../radiusSingleton');

const DisableRadiusIOTConnection = (macAddress) => {
    let radiusConnection = RadiusSingleton.getInstance().getDatabase();

    radiusConnection.query('DELETE FROM radcheck WHERE username=?', [macAddress], (err) => {
        if(err)
            console.log(err)
    });
}

module.exports = { DisableRadiusIOTConnection };
