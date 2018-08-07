const imageUploadService = require('./services/image_upload_service');

const RsPeer = {
    onImageUpload: imageUploadService.onImageUpload};

module.exports = RsPeer;