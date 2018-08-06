const imageUploadService = require('./services/image_upload_service');
const loginService = require('./services/login_service');
const nconf = module.parent.require('nconf');
const ssoUrl = Buffer.from(nconf.get('ssoPath')).toString('base64');
const apiUrl = Buffer.from(nconf.get('rspeerApi')).toString('base64');

const RsPeer = {
    onImageUpload: imageUploadService.onImageUpload,
	onLogin : loginService.onRouteChange
};

module.exports = RsPeer;