import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env

import { GitHubClient } from './githubClient.js';
import fs from 'fs/promises';

(async () => {
    const client = new GitHubClient();

    try {
        // // Example: Get branch info
        // const branchInfo = await client.getBranch('main');
        // console.log('Branch Info:', branchInfo);

        // // Example: Get folder contents
        // const folderContents = await client.getFolder('/src');
        // console.log('Folder Contents:', folderContents);

        // Example: Put a file
        const fileContent = await fs.readFile('./index.js', 'utf8');
        const putFileResponse = await client.putFile('src/githubClient.js', fileContent, 'Adding a new file');
        console.log('Put File Response:', putFileResponse);

        // // Example: Delete a file
        // const deleteFileResponse = await client.deleteFile('src/rec/githubClient.js');
        // console.log('Delete File Response:', deleteFileResponse);

    } catch (error) {
        console.error('Error:', error);
    }
})();
