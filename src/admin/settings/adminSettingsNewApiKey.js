const { DatabaseSingleton } = require("../../utils/databaseSingleton");

const AdminSettingsNewApiKey = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    
    let key_length = 58;
    var result           = '';
    var characters       = '?!ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < key_length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    database.query('UPDATE settings SET setting_value = ? WHERE setting_name = "api_token"', [result], (errors, results, fields) => {
        res.redirect('/admin/settings/');
    });
}

module.exports = { AdminSettingsNewApiKey };
