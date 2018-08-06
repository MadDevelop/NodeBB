const imageUploadService = require('./services/image_upload_service');
const loginService = require('./services/login_service');
const nconf = module.parent.require('nconf');
const ssoUrl = Buffer.from(nconf.get('ssoPath')).toString('base64');
const apiUrl = Buffer.from(nconf.get('rspeerApi')).toString('base64');

const RsPeer = {
    onImageUpload: imageUploadService.onImageUpload,
    onAppLoad : (params, callback) => {
        params.router.use(async (req, res, next) => {
        	console.log(req.path);
        	if(req.path === "/categories" || req.path === '/') {
				res.cookie('sso_url', ssoUrl);
				res.cookie('api_url', apiUrl);
				const loginToken = req.query.idToken;
				console.log("Logging in.");
				if(loginToken) {
					await loginService.loginWithToken(req, req.query.idToken, next);
				} else {
					next();
				}
			} else {
        		next();
			}
        });
        callback();
    }
};

module.exports = RsPeer;