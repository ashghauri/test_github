import fetch from 'node-fetch';
import btoa from 'btoa'; // For encoding file content to base64

export class GitHubClient {

    constructor(properties) {
        const defaults = {
            repoOwner: process.env['REPO_OWNER'] || 'ashghauri',
            repoName: process.env['REPO_NAME'] || 'test_github',
            branch: process.env['BRANCH'] || 'main',
            token: process.env['GITHUB_TOKEN'],
        };
        this.properties = Object.assign({}, defaults, properties || {});
        if (!this.properties.token) throw new Error("GitHub token needs to be provided");
    }

    _fetchGitHubAPI(endpoint, method = 'GET', body = null) {
        const url = `https://api.github.com/repos/${this.properties.repoOwner}/${this.properties.repoName}${endpoint}`;
        return fetch(url, {
            method: method,
            headers: {
                'Authorization': `token ${this.properties.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : null
        }).then(res => res.json());
    }

    async getBranch(branchName) {
        if (!branchName) throw new Error("Branch Name needs to be provided");
        return this._fetchGitHubAPI(`/branches/${branchName}`);
    }

    async getFolder(folderPath) {
        // if (!folderPath) throw new Error("Folder Path needs to be provided");
        return this._fetchGitHubAPI(`/contents/${folderPath}?ref=${this.properties.branch}`);
    }

    async deleteFile(filePath) {
        if (!filePath) throw new Error("File Path needs to be provided");

        // Get file's SHA (required to delete a file in GitHub)
        const file = await this._fetchGitHubAPI(`/contents/${filePath}?ref=${this.properties.branch}`);
        const sha = file.sha;

        const body = {
            message: `Deleting file: ${filePath}`,
            sha: sha,
            branch: this.properties.branch
        };

        return this._fetchGitHubAPI(`/contents/${filePath}`, 'DELETE', body);
    }

    async putFile(filePath, fileContent, commitMessage = 'Committing file') {
        if (!filePath) throw new Error("File Path needs to be provided");
        if (!fileContent) throw new Error("File content needs to be provided");

        // Get file's SHA if it already exists (for updating)
        let sha = null;
        try {
            const file = await this._fetchGitHubAPI(`/contents/${filePath}?ref=${this.properties.branch}`);
            sha = file.sha;
        } catch (error) {
            // File doesn't exist, so no SHA is needed
        }

        const body = {
            message: commitMessage,
            content: btoa(fileContent),
            branch: this.properties.branch
        };

        if (sha) {
            body.sha = sha;
        }

        return this._fetchGitHubAPI(`/contents/${filePath}`, 'PUT', body);
    }
}
