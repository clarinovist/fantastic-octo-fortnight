const email = 'budi@example.com';
const password = 'password123';
const fs = require('fs');

async function loginAndUpload() {
  try {
    // 1. Login
    const loginRes = await fetch('http://localhost:8082/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.data?.accessToken;
    
    // 2. Upload via Proxy
    const fileBuffer = fs.readFileSync('/root/fantastic-octo-fortnight/frontend/public/lesprivate-logo-white.png');
    const fileBlob = new Blob([fileBuffer], { type: 'image/png' });
    
    const formData = new FormData();
    formData.append('file', fileBlob, 'logo.png');

    const uploadRes = await fetch('http://localhost:8087/api/v1/files/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Cookie': `lesprivate_token=${token};` 
      }
    });

    const text = await uploadRes.text();
    console.log('Upload Status:', uploadRes.status);
    console.log('Upload Response:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

loginAndUpload();
