const path = require('path');
const {google} = require('googleapis');

// Path to service account credentials file
const CREDENTIALS_PATH = path.join(process.cwd(), './service-creds.json');

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file', 
  // 'https://www.googleapis.com/auth/admin.directory.user', 
  // 'https://www.googleapis.com/auth/admin.directory.user.readonly',
  // 'https://www.googleapis.com/auth/admin.directory.user.security',
];

async function runSample() {
  try {
    // Load the service account credentials directly
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH, 
      scopes: SCOPES,
    });

    // Get the authorized client
    const client = await auth.getClient();
    
    // Create drive instance
    const drive = google.drive({ version: 'v3', auth: client });
    
    // const clientMaterialsFolderId = "14HUQsv5QCct5ita2H8It6rKXV91navQm";
    // const query = `'${clientMaterialsFolderId}' in parents and trashed = false`;
    
    const params = {
      pageSize: 10,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      fields: 'nextPageToken, files(id, name, mimeType, createdTime, modifiedTime, size, webViewLink, shared)',
      // q: query,
    };

    // Add error handling for the API call
    const res = await drive.files.list(params);
    
    if (!res.data.files || res.data.files.length === 0) {
      console.log('No files found.');
      return [];
    }

    console.log(`Files found (In current page ${res.data.files.length }): `, res.data.files);
    return res.data;

  } catch (error) {
    console.error('Error details:', error.message);
    
    // Provide more specific error messages
    if (error.message.includes('credentials')) {
      console.error('\nCredentials Error: Make sure your service-creds.json file exists and is valid.');
      console.error('The file should be in:', CREDENTIALS_PATH);
    }
    
    if (error.message.includes('permission')) {
      console.error('\nPermission Error: Make sure the service account has access to the folder.');
      console.error('Folder ID being accessed:', clientMaterialsFolderId);
    }
    
    throw error;
  }
}

if (module === require.main) {
  runSample().catch(console.error);
}

module.exports = runSample;