let mysql = require('mysql');
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false});
let session = require('express-session');
require('dotenv').config();

let connection = mysql.createConnection({
    host    :   process.env.DB_HOST,
    user    :   process.env.DB_USER,
    password:   process.env.DB_PASS,
    database:   process.env.DB_NAME
});

connection.connect();

module.exports = (app) => {

    app.use(session({
        secret: "amnet-interface"
    }));
    
    /*
     * Displays a form, enabling logged-in user to open a ticket
     */
    app.get('/tickets/open-ticket/', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/tickets/open-ticket/';
            res.redirect('/access/login/');
        }
        else {
            res.render('tickets/open-ticket.html.twig', {data: req.session});
        }
    });

    /*
     * Allows logged-in user to close a ticket
     * FIXME: Any user can close a random ticket...
     */
    app.get('/tickets/close-ticket/:ticket_id', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/tickets/open-ticket/';
            res.redirect('/access/login/');
        }
        else {
            connection.query('UPDATE tickets SET ticket_state=1 WHERE ticket_id=?', [req.params.ticket_id], () => {
                res.redirect('/tickets/track-tickets/');
            })
        }
    });
    
    /*
     * Handle "open ticket" form submitting and register the new ticket
     * in the database
     */
    app.post('/tickets/add-ticket/', urlencodedParser, (req, res) => {
        let subject = req.body.subject;
        let content = req.body.content;
        let user_id = req.body.user_id;

        connection.query('INSERT INTO tickets(ticket_subject, ticket_user) VALUES(?, ?)', [subject, user_id], () => {
            connection.query('SELECT MAX(ticket_id) AS max FROM tickets', (errors, results, fields) => {
                connection.query('INSERT INTO tickets_discuss(discuss_ticket, discuss_user, discuss_message, discuss_order) VALUES(?, ?, ?, ?)', [results[0]['max'], user_id, content, 0], () => {
                    res.redirect('/tickets/track-tickets/');
                });
            });
        });
    });

    /*
     * Allows user to list all active tickets for him
     */
    app.get('/tickets/track-tickets/', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/tickets/track-tickets/';
            res.redirect('/access/login/');
        }
        else {
            connection.query('SELECT * FROM tickets WHERE ticket_user=? ORDER BY ticket_id DESC', [req.session.user_id], (errors, results, fields) => {
                res.render('tickets/track-tickets.html.twig', {data: req.session, tickets: results}); 
            });
        }
    });

    /*
     * Displays a specific ticket discussion, execute various SQL
     * requests and transmit data to the view template
     */
    app.get('/tickets/view-ticket/', (req, res) => {
        if(!req.session['logged_in']){
            if(req.query.ticket_id != null)
                req.session.returnTo = '/tickets/view-ticket/?ticket_id='+req.query.ticket_id;
            else
                req.session.returnTo = '/tickets/track-tickets/'
            res.redirect('/access/login/');
        }
        else {
            let ticket_id = req.query.ticket_id;
            connection.query('SELECT * FROM tickets_discuss WHERE discuss_ticket=? ORDER BY discuss_order', [ticket_id], (errors, results, fields) => {
                if(results.length < 1){
                    res.redirect('/tickets/track-tickets/');
                }
                else
                {
                    connection.query('SELECT * FROM users INNER JOIN (SELECT * FROM tickets_discuss WHERE discuss_ticket=? ORDER BY discuss_order) AS T ON user_id=discuss_user GROUP BY user_name', [ticket_id], (errors, users_results, fields) => {
                        let user_list = {};
                        console.log(users_results);
                        for(let k = 0; k < users_results.length; k++){
                            let user = users_results[k];
                            console.log(user['user_id']);
                            user_list[user['user_id']] = user;
                        }
                        console.log(user_list);
                        res.render('tickets/view-ticket.html.twig', {data: req.session, discussion: results, ticket_id: results[0].discuss_ticket, users: user_list});
                    });
                }
            });
        }
    });

    /*
     * Handle response sending, register any new response to the ticket
     * on the SQL database
     */
    app.post('/tickets/send-response/', urlencodedParser, (req, res) => {
        let ticket_id = req.body.ticket_id;
        let message = req.body.msg_content;

        connection.query('SELECT MAX(discuss_order) AS max_order FROM tickets_discuss WHERE discuss_ticket=?', [ticket_id], (errors, results, fields) => {
            if(results.length > 0){
                let next_order = results[0].max_order + 1;
                connection.query('INSERT INTO tickets_discuss(discuss_ticket, discuss_user, discuss_message, discuss_order) VALUES(?, ?, ?, ?)', [ticket_id, req.session.user_id, message, next_order], () => {
                    res.redirect('back');
                });
            }
            else
                res.redirect('/tickets/track-tickets/');
        });
    });

    /*
     * Allows admin to list all tickets and managing them easily
     */
    app.get('/tickets/admin-tickets/', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/tickets/admin-tickets/';
            res.redirect('/access/login/');
        }
        else {
            if(req.session['user_rank'] != "admin")
            {
                res.redirect('/');
            }
            else {
                req.session.returnTo = '/tickets/admin-tickets/';
                connection.query('SELECT * FROM tickets WHERE ticket_state=1', (errors, closed_tickets, fields) => {
                    connection.query('SELECT * FROM tickets WHERE ticket_state=0', (errors, opened_tickets, fields) => {
                        res.render('tickets/admin-tickets.html.twig', {data: req.session, opened_tickets: opened_tickets, closed_tickets: closed_tickets});
                    });
                });
            }
        }
    });
}