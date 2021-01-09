const { DatabaseSingleton } = require("../../utils/databaseSingleton");
const { DisableRadiusConnection } = require("../../utils/radius/disableRadiusConnection");

const AdminDisableGuestAccess = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();

    database.query('UPDATE settings SET setting_value = 0 WHERE setting_name="guest_access"', () => {
        DisableRadiusConnection();
        res.redirect('/admin');
    });
}

module.exports = { AdminDisableGuestAccess };