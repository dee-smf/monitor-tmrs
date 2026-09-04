import { LastDataCheckRepositoryInterface } from '../../application/LastDataCheckRepositoryInterface.js';

export class GitHubLastDataCheckRepository extends LastDataCheckRepositoryInterface {
    constructor(owner, repo) {
        super();
        this._url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/update-data.yml/runs?per_page=1`;
    }

    async getLastRunDate() {
        try {
            const res = await fetch(this._url);
            if (!res.ok) return null;
            const data = await res.json();
            const runs = data.workflow_runs;
            if (!runs || runs.length === 0) return null;
            return new Date(runs[0].updated_at).getTime();
        } catch {
            return null;
        }
    }
}
