const nconf = module.parent.parent.require('nconf');
const User = module.parent.parent.require('./user');
const Auth = module.parent.parent.require('./controllers/authentication');

const rp = require('request-promise');

const LoginService = {};

LoginService.onRouteChange = async (data, callback) => {

	console.log(data.templateData);
	const path = data.templateData.url || data.req.route.path;
	const idToken = data.req.query.idToken;
	if(idToken) {
		await LoginService.loginWithToken(data.req, idToken);
		data.templateData.loggedIn = true;
		return callback(null, data);
	}
	if(path !== "/login2") {
		return callback(null, data);
	}
	const sso = nconf.get('ssoPath');
	data.res.redirect(`${sso}?redirect=${nconf.get('url')}`);
};

LoginService.onLoginBuild = async (data, callback) => {
	callback(null, data);
};

LoginService.loginWithToken = async (req, token, next) => {

	const lookupUser = (email) => new Promise((res, rej) => {
		User.getUidByEmail(email, (err, uid) => {
			if(err) rej("Failed to lookup user by email " + email);
			res(uid);
		})
	});

	const login = (userId) => new Promise((res, rej) => {
		req.login({uid: userId}, next);
		Auth.onSuccessfulLogin(req, userId, (err) => {
			if (err) res(err);
			console.log("Logged in with: " + userId);
			res();
		})
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
