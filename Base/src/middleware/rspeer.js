const nconf = module.require('nconf');

const ssoUrlBase64 = Buffer.from(nconf.get('ssoPath')).toString('base64');
const apiUrlBase64 = Buffer.from(nconf.get('rspeerApi')).toString('base64');

module.exports = function (middleware) {
	middleware.rsPeerLogin = function (req, res, next) {
		res.cookie('sso_url', ssoUrlBase64);
		res.cookie('api_url', apiUrlBase64);
		if (req.loggedIn && req.query.idToken) {
			return res.redirect("/")
		}
		if (req.loggedIn) {
			return next();
		}
		if (!req.query.idToken) {
			return next();
		}
		const apiUrl = nconf.get('rspeerApi');
		const request = require('request');
		console.log("Attempting to login.")
		request(`${apiUrl}/user/me`, {
			headers: {
				'Authorization': `bearer ${req.query.idToken}`
			}
		}, function (err, data) {
			if (err) {
				console.log(err);
				next();
			}
			const parsed = JSON.parse(data.body);
			console.log(parsed);
			if (!data || !data.body || !parsed.email) {
				next();
			}
			const User = require('../user');
			try {
				User.getUidByEmail(parsed.email, (err, uid) => {
					if (err) {
						console.log(err);
						next();
					}
					const Auth = require('./../controllers/authentication');
					req.login({uid: uid}, next);
					Auth.onSuccessfulLogin(req, uid, (err) => {
						if (err) {
							console.log(err);
						}
					})
				});
			} catch (e) {
				console.log(e);
				next();
			}
		});
	}
};