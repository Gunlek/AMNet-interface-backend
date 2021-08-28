const { DatabaseSingleton } = require("../utils/databaseSingleton");

/*
 * Displays the sign-in page
*/
const UserSignin = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    let signin_failed = false;
    let fail_reason = "";
    if(req.query.state != null){
        signin_failed = true;
        fail_reason = req.query.state;
    }
    
    database.query('SELECT * FROM settings', (error, settings_results, fields) => {
        let settings = {};
        settings_results.forEach(param => {
            settings[param['setting_name']] = param['setting_value'].replace(/<br\/>/g, '\n');
        });

        database.query('SELECT * FROM documents WHERE document_title="reglement_interieur" OR document_title="statuts"', (err, results) => {
            let documents = {};
            if(err)
                console.error(err);
            results.forEach(document => {
                documents[document.document_title] = {
                    key: document.document_title,
                    path: document.document_path
                };
            });

            res.render('users/signin.html.twig', { data: req.session, signin_failed: signin_failed, fail_reason: fail_reason, setting: settings, documents: documents });
        });
    });
}

module.exports = { UserSignin };

