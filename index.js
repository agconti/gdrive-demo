const path = require('path');
const {google} = require('googleapis');
const {authenticate} = require('@google-cloud/local-auth');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
];
const drive = google.drive('v3');

async function runSample() {
  // Obtain user credentials to use for the request
  const auth = await authenticate({
    keyfilePath: CREDENTIALS_PATH,
    scopes: SCOPES,
  });
  google.options({auth});
  
  
  const clientMaterialsFolderId = "14HUQsv5QCct5ita2H8It6rKXV91navQm"
  const query = `'${clientMaterialsFolderId}' in parents and trashed = false`;
  const params = {
    pageSize: 5, 
    includeItemsFromAllDrives: true, 
    supportsAllDrives: true,
    fields: 'nextPageToken, files(id, name, mimeType, createdTime, modifiedTime, size, webViewLink, shared)',
    q: query,
  };
  
  const res = await drive.files.list(params);
  console.log(res.data);
  return res.data;
}

if (module === require.main) {
  runSample().catch(console.error);
}
module.exports = runSample;