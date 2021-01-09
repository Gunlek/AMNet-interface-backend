const { DatabaseSingleton } = require("../../utils/databaseSingleton");
const { EnableRadiusGuestConnection } = require("../../utils/radius/enableRadiusGuestConnection");

const AdminEnableGuestAccess = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();

    database.query('UPDATE settings SET setting_value = 1 WHERE setting_name="guest_access"', () => {
        EnableRadiusGuestConnection();
        res.redirect('/admin');
    });
}

module.exports = { AdminEnableGuestAccess };