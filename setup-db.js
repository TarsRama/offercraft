const https = require('https');

// Create a simple POST request function
function makeRequest(hostname, path, method, headers, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: hostname,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function setupDatabase() {
  const apiKey = 'napi_dspta24ox58oolykm9xkarhrpv81jyxzyc6g94hst9z34q6crzw19jq8t4udka03';
  
  try {
    console.log('Creating Neon database project...');
    
    const result = await makeRequest(
      'console.neon.tech',
      '/api/v2/projects',
      'POST',
      { 'Authorization': `Bearer ${apiKey}` },
      {
        project: {
          name: 'offercraft',
          region_id: 'aws-us-east-1'
        }
      }
    );

    console.log('Response status:', result.status);
    console.log('Response data:', result.data);

    if (result.status === 201 && result.data.project) {
      const project = result.data.project;
      console.log('\nDatabase created successfully!');
      console.log('Project ID:', project.id);
      
      // Get the database connection details
      const endpoints = result.data.endpoints || [];
      const databases = result.data.databases || [];
      const roles = result.data.roles || [];
      
      if (endpoints.length > 0 && databases.length > 0 && roles.length > 0) {
        const endpoint = endpoints[0];
        const database = databases[0];
        const role = roles[0];
        
        const connectionString = `postgresql://${role.name}:${role.password}@${endpoint.host}/${database.name}?sslmode=require`;
        
        console.log('\nConnection details:');
        console.log('Host:', endpoint.host);
        console.log('Database:', database.name);
        console.log('Username:', role.name);
        console.log('Password:', role.password);
        
        console.log('\n=== Add these to your .env file ===');
        console.log(`DATABASE_URL="${connectionString}"`);
        console.log(`DIRECT_URL="${connectionString}"`);
      }
    } else {
      console.error('Failed to create database. Status:', result.status);
      console.error('Response:', result.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

setupDatabase();