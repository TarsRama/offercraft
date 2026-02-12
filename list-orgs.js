const fetch = require('node-fetch');

async function listOrganizations() {
  const apiKey = 'napi_dspta24ox58oolykm9xkarhrpv81jyxzyc6g94hst9z34q6crzw19jq8t4udka03';
  
  try {
    console.log('Listing organizations...');
    const response = await fetch('https://console.neon.tech/api/v2/projects', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Existing projects:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error('Error listing projects:', data);
    }
  } catch (error) {
    console.error('Failed to list projects:', error.message);
  }
}

listOrganizations();