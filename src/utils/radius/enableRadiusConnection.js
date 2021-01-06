const { RadiusSingleton } = require('../radiusSingleton');

const EnableRadiusConnection = (username) => {
    let radiusConnection = RadiusSingleton.getInstance().getDatabase();

    radiusConnection.query('UPDATE radusergroup SET groupname="pgmoyss" WHERE username=?', [username], (err) => {
        if(err)
            console.log(err)
    });
}

module.exports = { EnableRadiusConnection };
