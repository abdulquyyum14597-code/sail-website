const http = require('http');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  console.log('Testing image upload endpoint...');

  // 1. Login to get token
  const loginData = JSON.stringify({ password: 'sail2026' });
  const loginRes = await new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: 'localhost',
        port: 8000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginData),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => resolve(JSON.parse(body)));
      }
    );
    req.on('error', reject);
    req.write(loginData);
    req.end();
  });

  const token = loginRes.token;

  // 2. Prepare multipart body
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const sampleImageContent = Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;', 'binary');

  let pre = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test-lab-photo.gif"\r\nContent-Type: image/gif\r\n\r\n`;
  let post = `\r\n--${boundary}--\r\n`;
  const bodyBuffer = Buffer.concat([Buffer.from(pre, 'utf8'), sampleImageContent, Buffer.from(post, 'utf8')]);

  const uploadRes = await new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: 'localhost',
        port: 8000,
        path: '/api/upload',
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': bodyBuffer.length,
          Authorization: `Bearer ${token}`,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
      }
    );
    req.on('error', reject);
    req.write(bodyBuffer);
    req.end();
  });

  console.log('Upload response:', uploadRes);

  if (uploadRes.status === 200 && uploadRes.body.success && uploadRes.body.url) {
    console.log('[PASS] Image upload successful. URL:', uploadRes.body.url);

    // Verify static serving of uploaded image
    const getUploaded = await new Promise((resolve, reject) => {
      http.get(`http://localhost:8000/${uploadRes.body.url}`, (res) => {
        resolve({ status: res.statusCode });
      }).on('error', reject);
    });

    if (getUploaded.status === 200) {
      console.log('[PASS] Uploaded image is statically accessible via HTTP GET 200 OK');
    } else {
      console.error('[FAIL] Uploaded image could not be fetched:', getUploaded.status);
      process.exit(1);
    }
  } else {
    console.error('[FAIL] Image upload failed');
    process.exit(1);
  }
}

testUpload().catch(console.error);
