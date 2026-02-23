const fs = require('fs');

async function testUpload() {
  const fileBuffer = fs.readFileSync('/root/fantastic-octo-fortnight/frontend/public/lesprivate-logo-white.png');
  const fileBlob = new Blob([fileBuffer], { type: 'image/png' });
  
  const formData = new FormData();
  formData.append('file', fileBlob, 'logo.png');

  try {
    const res = await fetch('http://localhost:8082/v1/files/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': 'Bearer test'
      }
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testUpload();
