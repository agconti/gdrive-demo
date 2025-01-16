const path = require('path');
const {google} = require('googleapis');

const CREDENTIALS_PATH = path.join(process.cwd(), 'service-creds.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

// Configuration
const ROOT_FOLDER_NAME = 'Client Materials';
const SUBFOLDERS = ['Pre-Sale', 'Post-Sale', 'Final Docs'];

async function createFolderStructure(clientName, brandName, dealName) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: SCOPES,
    });

    const client = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: client });

    // Get or verify root folder (Client Materials)
    const rootFolder = await findFolder(drive, ROOT_FOLDER_NAME);
    if (!rootFolder) {
      throw new Error(`Root folder "${ROOT_FOLDER_NAME}" not found`);
    }

    // Create or get client folder
    const clientFolder = await findOrCreateFolder(drive, clientName, rootFolder.id);
    console.log(`Client folder ${clientName}: ${clientFolder.id}`);

    // Create or get brand folder
    const brandFolder = await findOrCreateFolder(drive, brandName, clientFolder.id);
    console.log(`Brand folder ${brandName}: ${brandFolder.id}`);

    // Create deal folder
    const dealFolder = await createFolder(drive, dealName, brandFolder.id);
    console.log(`Deal folder ${dealName}: ${dealFolder.id}`);

    // Create subfolders
    const createdSubfolders = await Promise.all(
      SUBFOLDERS.map(name => createFolder(drive, name, dealFolder.id))
    );

    console.log({rootFolder})
    console.log('Created folder structure:', {
      clientFolder,
      brandFolder,
      dealFolder,
      subfolders: createdSubfolders.map(folder => ({
        name: folder.name,
        id: folder.id
      }))
    });

    return {
      clientFolder,
      brandFolder,
      dealFolder,
      subfolders: createdSubfolders
    };

  } catch (error) {
    console.error('Error creating folder structure:', error.message);
    throw error;
  }
}

async function findFolder(drive, folderName, parentId = null) {
  try {
    const query = [
      `mimeType = 'application/vnd.google-apps.folder'`,
      `name = '${folderName}'`,
      `trashed = false`
    ];
    
    if (parentId) {
      query.push(`'${parentId}' in parents`);
    }

    const response = await drive.files.list({
      q: query.join(' and '),
      fields: 'files(id, name, webViewLink)',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true
    });

    return response.data.files[0];
  } catch (error) {
    console.error(`Error finding folder ${folderName}:`, error.message);
    throw error;
  }
}

async function createFolder(drive, folderName, parentId) {
  try {
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id, name, webViewLink',
      supportsAllDrives: true
    });

    return response.data;
  } catch (error) {
    console.error(`Error creating folder ${folderName}:`, error.message);
    throw error;
  }
}

async function findOrCreateFolder(drive, folderName, parentId) {
  const existingFolder = await findFolder(drive, folderName, parentId);
  if (existingFolder) {
    console.log(`Found existing folder: ${folderName}`);
    return existingFolder;
  }

  console.log(`Creating new folder: ${folderName}`);
  return await createFolder(drive, folderName, parentId);
}

// Example usage
async function runSample() {
  try {
    const result = await createFolderStructure(
      'Example Client',
      'Example Brand',
      'Q1 2025 Campaign'
    );
    console.log('Folder structure created successfully', result);
    return result;
  } catch (error) {
    console.error('Failed to create folder structure:', error);
    throw error;
  }
}

if (module === require.main) {
  runSample().catch(console.error);
}

module.exports = {
  createFolderStructure,
  findFolder,
  createFolder,
  findOrCreateFolder
};1