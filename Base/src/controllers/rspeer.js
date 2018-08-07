const rspeerController = module.exports;
const nconf = require('nconf');
const User = require('./../user')
const Groups = require('../groups');

const hasValidToken = (req) => req.query.rspeerToken === nconf.get('rspeerApiToken');

rspeerController.register = function (req, res) {
	if(!hasValidToken(req)) {
		return res.json({error : "Invalid token."})
	}
	User.create({
		username : req.body.username,
		email : req.body.email,
		acceptTos : true
	}, function (err, data) {
		if(err) {
			res.json({error : err.message});
			return;
		}
		res.json({userId : data});
		return;
	});
};

rspeerController.addToGroup = function (req, res) {
	try {
		if (!hasValidToken(req)) {
			return res.json({error: "Invalid token."})
		}
		const group = req.query.group;
		const email = req.query.email;
		User.getUidByEmail(email, function (err, uid) {
			Groups.join(group, uid, function (err, data) {
				if (err) {
					return res.json({error: err})
				}
				User.getUsersWithFields([uid], ['groupTitle'], uid, function (err, data) {
					if (!data || data.length === 0) {
						return res.json({error: 'Unable to add user to group title. Did not find user.'})
					}
					const user = data[0];
					const parsed = JSON.parse(user.groupTitle);
					if (parsed.indexOf(group) === -1) {
						parsed.push(group);
					}
					User.setUserFields(uid, {
						groupTitle: JSON.stringify(parsed)
					}, function (err, result) {
						Groups.clearCache(uid, group);
						res.json(result)
					});
				})
			});
		});
	} catch (e) {
		return res.json(e);
	}
};

rspeerController.getGroups = function (req, res) {
	try {
		User.getUidByEmail(req.query.email, function (err, uid) {
			Groups.getUserGroups([uid], function (err, data) {
				return res.json(data);
			})
		});
	} catch (e) {
		return res.json(e);
	}
};