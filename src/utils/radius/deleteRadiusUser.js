const DeleteRadiusUser = (username) => {
    let radiusConnection = RadiusSingleton.getInstance().getDatabase();

    radiusConnection.query('DELETE FROM radcheck WHERE radcheck.username = ?', [username], (err) => {
        if(err)
            console.log(err)
    });
    radiusConnection.query('DELETE FROM userinfo WHERE userinfo.username = ?', [username], (err) => {
        if(err)
            console.log(err)
    });
    radiusConnection.query('DELETE FROM radusergroup WHERE radusergroup.username = ?', [username], (err) => {
        if(err)
            console.log(err)
    })
}

module.exports = { DeleteRadiusUser };