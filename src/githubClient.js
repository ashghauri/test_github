import { Octokit } from '@octokit/rest'; //GitHub REST API client for JavaScript
import btoa from 'btoa';

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

        // Initialize Octokit with the provided token
        this.octokit = new Octokit({
            auth: this.properties.token,
        });
    }

    async getBranch(branchName) {
        if (!branchName) throw new Error("Branch Name needs to be provided");
        try {
            const response = await this.octokit.repos.getBranch({
                owner: this.properties.repoOwner,
                repo: this.properties.repoName,
                branch: branchName,
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get branch: ${error.message}`);
        }
    }

    async getFolder(folderPath) {
        try {
            if (!folderPath) throw new Error("Path needs to be provided");

            const response = await this.octokit.repos.getContent({
                owner: this.properties.repoOwner,
                repo: this.properties.repoName,
                path: folderPath,
                ref: this.properties.branch,
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get folder: ${error.message}`);
        }
    }

    async deleteFile(filePath) {
        if (!filePath) throw new Error("File Path needs to be provided");

        try {
            const file = await this.octokit.repos.getContent({
                owner: this.properties.repoOwner,
                repo: this.properties.repoName,
                path: filePath,
                ref: this.properties.branch,
            });
            const sha = file.data.sha;

            const response = await this.octokit.repos.deleteFile({
                owner: this.properties.repoOwner,
                repo: this.properties.repoName,
                path: filePath,
                message: `Deleting file: ${filePath}`,
                sha: sha,
                branch: this.properties.branch,
            });

            return response.data;
        } catch (error) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }

    async putFile(filePath, fileContent, commitMessage = 'Committing file') {
        if (!filePath) throw new Error("File Path needs to be provided");
        if (!fileContent) throw new Error("File content needs to be provided");

        let sha = null;
        try {
            const file = await this.octokit.repos.getContent({
                owner: this.properties.repoOwner,
                repo: this.properties.repoName,
                path: filePath,
                ref: this.properties.branch,
            });
            sha = file.data.sha;
        } catch (error) {
            console.log("File doesn't exist, so no SHA is needed");
        }

        const response = await this.octokit.repos.createOrUpdateFileContents({
            owner: this.properties.repoOwner,
            repo: this.properties.repoName,
            path: filePath,
            message: commitMessage,
            content: btoa(fileContent),
            branch: this.properties.branch,
            sha: sha,
        });

        return response.data;
    }
}
