//var bcrypt = require('bcrypt-nodejs');
//var express = require('express')
//var app = express()

module.exports = function(app,passport) {
	
	app.get('/',isLoggedIn,function(req,res){
        var row = [];
        var row2=[];
		
		req.getConnection(function(error, conn) {
			conn.query('select * from bpl_users where user_id = ?',[req.user.id], function (err, rows) {
				if (err) {
					console.log(err);
				} else {
					if (rows.length) {
						for (var i = 0, len = rows.length; i < len; i++) { 
							row[i] = rows[i];
							
						}  
					}
					//console.log(row);					
				}
				//console.log(row);
				var admin = req.session.admin
				if (admin == 'Y') {
					res.redirect('/admin')
				} else {
					res.redirect('/options')
				}
				//res.render('index.ejs', {rows : row}); // user.ejs ye gönderiyoruz . 
			})
			
		})
    })

    app.get('/login', function(req, res) {

        res.render('login.ejs',{ message: req.flash('loginMessage') });

    });
	
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/', 
            failureRedirect : '/login',
            failureFlash : true 
        }),
        function(req, res) {
            //console.log("hello");
			
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
			  req.session.cookie.maxAge = 1000 * 60 * 3;
              //req.session.cookie.expires = false;
            }
        res.redirect('/');
    });
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
	
	app.post('/options/update/(:id)', isLoggedIn, function(req, res, next) {
		//res.send(req.body.optradio);
		//console.log("Hello")
		var selTeam = req.body.optradio
		var matchNo = req.params.id
		var userID = req.session.user_id
		//console.log(req.session.user_id)
		
		var columnName = 'm' + matchNo 	

		updareQuery = "UPDATE bpl_options SET " + columnName + "=" + "'" + selTeam + "'" + " WHERE user_id = " + userID
		//console.log(updareQuery)
			
		req.getConnection(function(error, conn) {
			conn.query(updareQuery, function(err, result) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)
					
					// render to views/user/add.ejs
					res.redirect('/options')
				} else {
					var msg = "Successfully updated Match No:" + matchNo + " with " + selTeam + "! Wish you all the best! "
					req.flash('success', msg)
					//req.flash('success', 'Data updated successfully!')
					
					// render to views/user/add.ejs
					res.redirect('/options')
				}
			})
		 })
	})

	// SHOW LIST OF MATCHES
	app.get('/options', isLoggedIn, function(req, res, next) {
		req.getConnection(function(error, conn) {
			conn.query('SELECT * FROM bpl_matches ORDER BY id',function(err, rows, fields) {
				//if(err) throw err
				var isAdmin = req.session.admin
				if (isAdmin == 'Y') {
					res.redirect('/logout')
				} else {	
					if (err) {
						req.flash('error', err)
						res.render('option/list', {
							title: 'Matches List', 
							data: ''
						})
					} else {
						// render to views/user/list.ejs template file
						res.render('option/list', {
							title: 'Matches List', 
							data: rows,
							admin: 'Y'
						})
					}
				}	
			})
		})
	})
	
	app.get('/options/predictions', isLoggedIn, function(req, res, next) {
		req.getConnection(function(error, conn) {
			conn.query('SELECT * FROM bpl_predictions_vw',function(err, rows, fields) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)
					res.render('option/prediction', {
						title: 'Current Predictions', 
						data: ''
					})
				} else {
					// render to views/user/list.ejs template file
					res.render('option/prediction', {
						title: 'Current Predictions', 
						data: rows
					})
				}
			})
		})
	})
	
	//Show champion predictions
	app.get('/options/predictchampion', isLoggedIn, function(req, res, next) {
		req.getConnection(function(error, conn) {
			conn.query('SELECT * FROM bpl_champion',function(err, rows, fields) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)
					res.render('option/predictchampion', {
						title: 'Champion Predictions', 
						data: ''
					})
				} else {
					// render to views/user/list.ejs template file
					res.render('option/predictchampion', {
						title: 'Champion Predictions', 
						data: rows
					})
				}
			})
		})
	})
	
	app.post('/options/updatechamp/(:id)', isLoggedIn, function(req, res, next) {
		//res.send(req.body.optradio);
		//console.log("Hello")
		var selTeam = req.body.optradio
		//var matchNo = req.params.id
		var userID = req.session.user_id
		//console.log(req.session.user_id)
		
		var columnName = 'm' + matchNo 	

		updareQuery = "UPDATE bpl_champion SET " + champ + "=" + "'" + selTeam + "'" + " WHERE user_id = " + userID
		//console.log(updareQuery)
			
		req.getConnection(function(error, conn) {
			conn.query(updareQuery, function(err, result) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)
					
					// render to views/user/add.ejs
					res.redirect('/options')
				} else {
					var msg = "Successfully updated champion prediction with " + selTeam
					req.flash('success', msg)
					//req.flash('success', 'Data updated successfully!')
					
					// render to views/user/add.ejs
					res.redirect('/options')
				}
			})
		 })
	})
	
	
	
	
	app.get('/options/points', isLoggedIn, function(req, res, next) {
		req.getConnection(function(error, conn) {
			conn.query('SELECT * FROM bpl_points_summary_vw',function(err, rows, fields) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)
					res.render('option/points', {
						title: 'Points Summary', 
						data: ''
					})
				} else {
					// render to views/user/list.ejs template file
					res.render('option/points', {
						title: 'Points Summary', 
						data: rows
					})
				}
			})
		})
	})

};	
	//module.exports = app
function isLoggedIn(req,res,next){
		if(req.isAuthenticated())
			return next();
		res.redirect('/login');
}