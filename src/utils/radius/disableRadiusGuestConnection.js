const { RadiusSingleton } = require('../radiusSingleton');

const DisableRadiusGuestConnection = () => {
    let radiusConnection = RadiusSingleton.getInstance().getDatabase();

    radiusConnection.query("UPDATE radusergroup SET groupname='daloRADIUS-Disabled-Users' WHERE username='invite'", (err) => {
        if(err)
            console.log(err);
    });
}

module.exports = { DisableRadiusGuestConnection };
