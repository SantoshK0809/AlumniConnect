const fs = require('fs');

async function testAlumniProfileSave() {
  const token = process.argv[2];
  
  const formData = new FormData();
  formData.append('bio', 'Test bio');
  
  const imageBlob = new Blob([fs.readFileSync('test.jpg')], { type: 'image/jpeg' });
  formData.append('profileImage', imageBlob, 'test.jpg');
  
  const res = await fetch("http://localhost:4000/api/alumni/profile", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });
  
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}

testAlumniProfileSave();
