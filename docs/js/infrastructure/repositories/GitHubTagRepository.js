import { TagRepositoryInterface } from '../../application/TagRepositoryInterface.js';

export class GitHubTagRepository extends TagRepositoryInterface {
    constructor(owner, repo) {
        super();
        this._url = `https://api.github.com/repos/${owner}/${repo}/tags`;
    }

    async getLatest() {
        try {
            const res = await fetch(this._url);
            if (!res.ok) return null;
            const tags = await res.json();
            return tags.length > 0 ? tags[0].name : null;
        } catch {
            return null;
        }
    }
}
