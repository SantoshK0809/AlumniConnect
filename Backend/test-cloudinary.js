require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

async function testUpload() {
  fs.writeFileSync('test.jpg', 'fake image content');
  try {
    const res = await cloudinary.uploader.upload('test.jpg', { folder: 'test' });
    console.log('Success:', res);
  } catch (err) {
    console.error('Error:', err);
  }
}
testUpload();
