var LocalStrategy   = require('passport-local').Strategy;

var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var config = require('./config');
var dbOptions = {
	host:	  config.database.host,
	user: 	  config.database.user,
	password: config.database.password,
	port: 	  config.database.port, 
	database: config.database.db
}
var connection = mysql.createConnection(dbOptions);

connection.query('USE ' + config.database.db);

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
		console.log(user.user_id)
        done(null, user.user_id);
    });

	
    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM bpl_users WHERE user_id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });


    passport.use(
        'local-signup',
        new LocalStrategy({

            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true 
        },
        function(req, username, password, done) {

            connection.query("SELECT * FROM bpl_users WHERE user_id = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {

                    var newUserMysql = {
                        username: username,
                        //password: bcrypt.hashSync(password, null, null)
						passport: password
                    };

                    var insertQuery = "INSERT INTO users ( username, password ) values (?,?)";

                    connection.query(insertQuery,[newUserMysql.username, newUserMysql.password],function(err, rows) {
                        newUserMysql.id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    passport.use(
        'local-login',
        new LocalStrategy({
            
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true 
        },
        function(req, username, password, done) { 
            connection.query("SELECT * FROM bpl_users WHERE user_id = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'User Not Found')); 
                }

           
                //if (!bcrypt.compareSync(password, rows[0].password))
				if (password != rows[0].password)
                    return done(null, false, req.flash('loginMessage', 'Wrong Credentials'));

				req.session.user_id = username
				req.session.admin = rows[0].admin
                return done(null, rows[0]);
            });
        })
    );
};