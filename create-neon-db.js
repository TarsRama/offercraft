const fetch = require('node-fetch');

async function createNeonDatabase() {
  const apiKey = 'napi_dspta24ox58oolykm9xkarhrpv81jyxzyc6g94hst9z34q6crzw19jq8t4udka03';
  
  try {
    const response = await fetch('https://console.neon.tech/api/v2/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project: {
          name: 'offercraft-db',
          region_id: 'aws-us-east-2'
        }
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Database created successfully!');
      console.log('Project ID:', data.project.id);
      console.log('Database Host:', data.project.database_host);
      console.log('Database Name:', data.project.database_name);
      console.log('Connection URI:', data.project.connection_uris[0].connection_uri);
      
      // Extract the connection string
      const connectionUri = data.project.connection_uris[0].connection_uri;
      console.log('\nAdd this to your .env file:');
      console.log(`DATABASE_URL="${connectionUri}"`);
      console.log(`DIRECT_URL="${connectionUri}"`);
    } else {
      console.error('Error creating database:', data);
    }
  } catch (error) {
    console.error('Failed to create database:', error.message);
  }
}

createNeonDatabase();