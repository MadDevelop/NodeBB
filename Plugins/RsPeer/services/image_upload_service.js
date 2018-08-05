const nconf = module.parent.parent.require('nconf');
const aws = require('aws-sdk');
const fs = require('fs');
const uuidv4 = require('uuid/v4');

const ImageUploadService = {};
ImageUploadService.onImageUpload = (data, callback) => {
	const userId = data.uid;
	const endpoint = nconf.get('spacesEndPoint');
	const uploadPath = nconf.get("spacesUploadPath");
	const bucket = nconf.get('spacesBucketName');
	aws.config.update({ accessKeyId: nconf.get('spacesAccessKey'), secretAccessKey: nconf.get('spacesSecretKey') });
	const spacesEndpoint = new aws.Endpoint(endpoint);
	const s3 = new aws.S3({
		endpoint: spacesEndpoint
	});
	fs.readFile(data.image.path, async (err, data) => {
		if(err) {
			console.log(err);
		}
		const buffer = new Buffer(data, 'binary');
		const uuid = uuidv4();
		const key = `${uploadPath}/${userId}-${uuid}.png`;
		await s3.putObject({
			Bucket : bucket,
			Key: key,
			Body: buffer,
			ACL: 'public-read'
		},function (err, resp) {
			if(err) {
				return callback(err, null)
			}
			const uploadUrl = nconf.get('spacesUploadAccessPath') + `/${key}`;
			callback(null, {
				url: uploadUrl,
				name : `${userId}-${uuid}`
			});
		});
	});
};

module.exports = ImageUploadService