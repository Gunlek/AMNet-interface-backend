const { RadiusSingleton } = require('../radiusSingleton');

const UpdateRadiusAccountPassword = (username, password) => {
    let radiusConnection = RadiusSingleton.getInstance().getDatabase();

    radiusConnection.query('UPDATE radcheck SET value=? WHERE username=?', [password, username], (err) => {
        if(err)
            console.log(err)
    });
}

module.exports = { UpdateRadiusAccountPassword };
