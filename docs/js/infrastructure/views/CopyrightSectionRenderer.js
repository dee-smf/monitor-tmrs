import { GitHubTagRepository } from '../repositories/GitHubTagRepository.js';

export class CopyrightSectionRenderer {
    constructor(containerSelector, tagRepository, repositoryUrl) {
        this._container = document.querySelector(containerSelector);
        this._tagRepository = tagRepository;
        this._repositoryUrl = repositoryUrl;
    }

    async render() {
        const tag = await this._tagRepository.getLatest();
        this._container.innerHTML = `
            <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                © 2026 DEE Dados &amp; Subdivisão de Dados da Divisão de Economia e Estatística. Todos os direitos reservados.<br>
                <span class="font-bold">Secretaria Municipal da Fazenda - SMF</span>
            </p>
            <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mt-2">
                Website desenvolvido em regime de código aberto
                <a href="${this._repositoryUrl}" target="_blank" class="underline hover:text-primary transition-colors">no GitHub</a>
                ${tag ? `, na versão <span class="font-bold">${tag}</span>.` : '.'}
            </p>
        `;
    }
}
