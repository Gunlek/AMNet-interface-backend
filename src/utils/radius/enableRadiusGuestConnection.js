const { RadiusSingleton } = require('../radiusSingleton');

const EnableRadiusGuestConnection = () => {
    let radiusConnection = RadiusSingleton.getInstance().getDatabase();

    radiusConnection.query('UPDATE radusergroup SET groupname="" WHERE username="invite"', [], (err) => {
        if(err)
            console.log(err)
    });
}

module.exports = { EnableRadiusGuestConnection };
