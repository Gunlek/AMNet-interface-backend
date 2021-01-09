const { DatabaseSingleton } = require("../../utils/databaseSingleton");
const { DisableRadiusGuestConnection } = require("../../utils/radius/disableRadiusGuestConnection");

const AdminDisableGuestAccess = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();

    database.query('UPDATE settings SET setting_value="0" WHERE setting_name="guest_access"', () => {
        DisableRadiusGuestConnection();
        res.redirect('/admin');
    });
}

module.exports = { AdminDisableGuestAccess };