const { DatabaseSingleton } = require("../../utils/databaseSingleton");
const { replaceAll } = require('../../utils/replaceAll');

const AdminProcessDocumentUpdate = (req, res) => {
    let database = DatabaseSingleton.getInstance().database;
    Object.keys(req.files).forEach(key => {
        const file = req.files[key][0];
        const fieldname = file.fieldname;
        const path = replaceAll(file.destination.toString(), './statics/', '/') + file.filename;

        database.query('UPDATE documents SET document_path=? WHERE document_title=?', [path, fieldname]);
    });

    res.redirect('/admin/documents/');
}

module.exports = { AdminProcessDocumentUpdate };