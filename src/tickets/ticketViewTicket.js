const { DatabaseSingleton } = require('../utils/databaseSingleton');

/*
 * Displays a specific ticket discussion, execute various SQL
 * requests and transmit data to the view template
*/
const TicketViewTicket = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    if(!req.session['logged_in']){
        if(req.query.ticket_id != null)
            req.session.returnTo = '/tickets/view-ticket/?ticket_id='+req.query.ticket_id;
        else
            req.session.returnTo = '/tickets/track-tickets/'
        res.redirect('/access/login/');
    }
    else {
        let ticket_id = req.query.ticket_id;
        database.query('SELECT * FROM tickets_discuss WHERE discuss_ticket=? ORDER BY discuss_order', [ticket_id], (errors, results, fields) => {
            if(results.length < 1){
                res.redirect('/tickets/track-tickets/');
            }
            else
            {
                database.query('SELECT * FROM users INNER JOIN (SELECT * FROM tickets_discuss WHERE discuss_ticket=? ORDER BY discuss_order) AS T ON user_id=discuss_user GROUP BY user_name', [ticket_id], (errors, users_results, fields) => {
                    let user_list = {};
                    for(let k = 0; k < users_results.length; k++){
                        let user = users_results[k];
                        console.log(user['user_id']);
                        user_list[user['user_id']] = user;
                    }
                    res.render('tickets/view-ticket.html.twig', {data: req.session, discussion: results, ticket_id: results[0].discuss_ticket, users: user_list});
                });
            }
        });
    }
}

module.exports = { TicketViewTicket };
