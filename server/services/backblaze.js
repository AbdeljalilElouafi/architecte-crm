const B2 = require('backblaze-b2');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class BackblazeService {
  constructor() {
    this.b2 = new B2({
      applicationKeyId: process.env.B2_ACCESS_KEY_ID,
      applicationKey: process.env.B2_SECRET_ACCESS_KEY
    });
    this.authorized = false;
  }

  async authorize() {
    if (!this.authorized) {
      await this.b2.authorize();
      this.authorized = true;
    }
  }

  async uploadFile(file, prefix = 'documents') {
    await this.authorize();
    
    // Get upload URL
    const uploadUrlResponse = await this.b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID
    });

    // Generate unique filename
    const fileExt = path.extname(file.originalname);
    const fileName = `${prefix}/${uuidv4()}${fileExt}`;

    // Upload file
    const uploadResponse = await this.b2.uploadFile({
      uploadUrl: uploadUrlResponse.data.uploadUrl,
      uploadAuthToken: uploadUrlResponse.data.authorizationToken,
      fileName: fileName,
      data: file.buffer,
      contentLength: file.size,
      mime: file.mimetype
    });

    return {
      fileId: uploadResponse.data.fileId,
      fileName: fileName,
      downloadUrl: `https://f003.backblazeb2.com/file/${process.env.B2_BUCKET_NAME}/${fileName}`
    };
  }

  async deleteFile(fileName) {
    await this.authorize();
    
    // First get file info
    const fileInfo = await this.b2.listFileNames({
      bucketId: process.env.B2_BUCKET_ID,
      startFileName: fileName,
      maxFileCount: 1
    });

    if (fileInfo.data.files.length === 0) {
      throw new Error('File not found');
    }

    // Then delete the file
    await this.b2.deleteFileVersion({
      fileId: fileInfo.data.files[0].fileId,
      fileName: fileName
    });

    return true;
  }
}

module.exports = new BackblazeService();