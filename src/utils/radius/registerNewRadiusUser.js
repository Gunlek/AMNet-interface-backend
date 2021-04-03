const { RadiusSingleton } = require("../radiusSingleton");

const RegisterNewRadiusUser = (username, firstname, lastname, email, password) => {
    let radiusConnection = RadiusSingleton.getInstance().getDatabase();

    radiusConnection.query('INSERT INTO radcheck(username, attribute, op, value) VALUES (?, "Cleartext-Password", ":=", ?)', [username, password], (err) => {
        if(err)
            console.log(err)
    });
    radiusConnection.query('INSERT INTO radusergroup(username, groupname, priority) VALUES (?, "daloRADIUS-Disabled-Users", 0)', [username], (err) => {
        if(err)
            console.log(err)
    });
    radiusConnection.query('INSERT INTO userinfo(username, firstname, lastname, email, department, company, workphone, homephone, mobilephone, address, city, state, country, zip, notes, changeuserinfo, portalloginpassword, enableportallogin, creationdate, creationby, updatedate) VALUES (?, ?, ?, ?, "", "", "", "", "", "", "", "", "", "", "", 0, "", 0, NOW(), "amnet_birse", NULL)', [username, firstname, lastname, email], (err) => {
        if(err)
            console.log(err)
    })
}

module.exports = { RegisterNewRadiusUser };
