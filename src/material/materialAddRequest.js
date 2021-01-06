const { DatabaseSingleton } = require('../utils/databaseSingleton');

/*
 * Handle request adding, gathering data from access-request form
*/
const MaterialAddRequest = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    let description = req.body.description;
    let user_id = req.body.user_id;

    database.query('INSERT INTO materials(material_user, material_description) VALUES(?, ?)', [user_id, description], () => {
        res.redirect('/material/');
    });
}

module.exports = { MaterialAddRequest };
