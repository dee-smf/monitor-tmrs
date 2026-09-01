import { GitHubTagRepository } from '../repositories/GitHubTagRepository.js';

const STYLES = {
    paragraph: 'font-body-md text-body-md text-on-surface-variant leading-relaxed',
    boldSpan: 'font-bold',
    paragraphSmall: 'font-body-sm text-body-sm text-on-surface-variant leading-relaxed mt-2',
    link: 'underline hover:text-primary transition-colors',
};

export class CopyrightSectionRenderer {
    constructor(containerSelector, tagRepository, repositoryUrl) {
        this._container = document.querySelector(containerSelector);
        this._tagRepository = tagRepository;
        this._repositoryUrl = repositoryUrl;
    }

    async render() {
        const tag = await this._tagRepository.getLatest();
        this._container.innerHTML = `
            <p class="${STYLES.paragraph}">
                © 2026 DEE Dados &amp; Subdivisão de Dados da Divisão de Economia e Estatística. Todos os direitos reservados.<br>
                <span class="${STYLES.boldSpan}">Secretaria Municipal da Fazenda - SMF</span>
            </p>
            <p class="${STYLES.paragraphSmall}">
                Website desenvolvido em regime de código aberto
                <a href="${this._repositoryUrl}" target="_blank" class="${STYLES.link}">no GitHub</a>
                ${tag ? `, na versão <span class="${STYLES.boldSpan}">${tag}</span>.` : '.'}
            </p>
        `;
    }
}
