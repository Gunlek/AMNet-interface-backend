const { RadiusSingleton } = require('../radiusSingleton');

const DisableRadiusConnection = (username) => {
    let radiusConnection = RadiusSingleton.getInstance().getDatabase();

    radiusConnection.query('UPDATE radusergroup SET groupname="daloRADIUS-Disabled-Users" WHERE username=?', [username], (err) => {
        if(err)
            console.log(err)
    });
}

module.exports = { DisableRadiusConnection };
