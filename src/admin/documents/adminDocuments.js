const { DatabaseSingleton } = require("../../utils/databaseSingleton");

const AdminDocuments = (req, res) => {
    const database = DatabaseSingleton.getInstance().database;

    database.query('SELECT * FROM documents WHERE document_title="reglement_interieur" OR document_title="statuts"', (err, results) => {
        let documents = {};
        results.forEach(document => {
            documents[document.document_title] = {
                key: document.document_title,
                path: document.document_path
            };
        });
        res.render('admin/admin-documents.html.twig', { documents: documents });
    });
}

module.exports = { AdminDocuments };
