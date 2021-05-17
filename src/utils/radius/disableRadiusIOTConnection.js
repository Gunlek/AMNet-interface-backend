const { RadiusSingleton } = require('../radiusSingleton');
const { prepareMacAddress } = require('../prepareMacAddress');

const DisableRadiusIOTConnection = (macAddress) => {
    let radiusConnection = RadiusSingleton.getInstance().getDatabase();

    radiusConnection.query('DELETE FROM radcheck WHERE username=?', [prepareMacAddress(macAddress)], (err) => {
        if(err)
            console.log(err)
    });
}

module.exports = { DisableRadiusIOTConnection };
