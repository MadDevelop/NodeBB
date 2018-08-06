const nconf = module.parent.parent.require('nconf');
const User = module.parent.parent.require('./user');
const Auth = module.parent.parent.require('./controllers/authentication');

const rp = require('request-promise');

const LoginService = {};

LoginService.onRouteChange = async (req, res, next) => {
	console.log(req.path);
	const idToken = req.query.idToken;
	if(idToken) {
		await LoginService.loginWithToken(req, idToken);
		console.log("LOGGED IN");
		return next();
	}
	if(req.path !== "/login") {
		return next();
	}
	const sso = nconf.get('ssoPath');
	res.redirect(`${sso}?redirect=${nconf.get('url')}`);
	//next();
};

LoginService.onLoginBuild = async (data, callback) => {
	callback(null, data);
};

LoginService.loginWithToken = async (req, token) => {

	const lookupUser = (email) => new Promise((res, rej) => {
		User.getUidByEmail(email, (err, uid) => {
			if(err) rej("Failed to lookup user by email " + email);
			res(uid);
		})
	});

	const login = (userId) => new Promise((res, rej) => {
		req.login({uid: userId}, function () {
			Auth.onSuccessfulLogin(req, userId, (err) => {
				if (err) res(err);
				console.log("Logged in with: " + userId);
				res();
			})
		});

	});

	const user = await rp(`${nconf.get("rspeerApi")}/user/me`, {
		headers: {
			'Authorization': `bearer ${token}`
		}
	});
	const parsed = JSON.parse(user);
	const userId = await lookupUser(parsed.email);
	if(userId == null) {
		return;
	}
	try {
		await login(userId);
	} catch (e) {
		console.log(e);
	}
};

module.exports = LoginService;
