const imageUploadService = require('./services/image_upload_service');
const loginService = require('./services/login_service');
const nconf = module.parent.require('nconf');


const RsPeer = {
    onImageUpload: imageUploadService.onImageUpload,
    onAppLoad : (params, callback) => {
        params.router.use(async (req, res, next) => {
            res.cookie('sso_url', Buffer.from(nconf.get('ssoPath')).toString('base64'));
            res.cookie('api_url', Buffer.from(nconf.get('rspeerApi')).toString('base64'));
            const loginToken = req.query.idToken;
            loginToken
                ? loginService.loginWithToken(req, req.query.idToken, next)
                : next()
        });
        callback();
    }
};

module.exports = RsPeer;