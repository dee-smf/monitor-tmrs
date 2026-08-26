import { ModeSelectorPresenter } from "../../adapters/presenters/ModeSelectorPresenter.js";
import { RequestModel } from "../../application/UseCaseInterface.js";

const MODE_CONFIG = {
    RESULT:                { label: 'Resultado mensal',          icon: 'calendar_month', description: 'Visualize os dados detalhados referentes ao último mês fechado.',                               requiresYearSelector: false },
    ROLLING_12_PERIOD_SUM: { label: 'Resultado em 12 meses',     icon: 'history',        description: 'Acompanhe a evolução histórica no período de um ano completo.',                                      requiresYearSelector: false },
    CUM_SUM_BY_YEAR:       { label: 'Acumulado no ano',          icon: 'query_stats',    description: 'Demonstra a evolução dos valores de maneira acumulada ao longo do ano.',                               requiresYearSelector: true  },
};

const ACTIVE_CLASSES = ['bg-primary-container', 'border', 'border-primary', 'rounded-lg', 'shadow-sm'];
const INACTIVE_CLASSES = ['bg-surface-container-lowest', 'border', 'border-outline-variant', 'rounded-lg', 'hover:border-primary', 'hover:shadow-md'];

export class HtmlModeSelectorRenderer extends ModeSelectorPresenter {
    constructor(containerSelector, repository, map = MODE_CONFIG, onRequest = null) {
        super();
        this._container = document.querySelector(containerSelector);
        this._repository = repository;
        this._map = map;
        this._onRequest = onRequest;
        this._activeMode = null;
        this._activeCard = null;
        this._yearsSelect = null;
    }

    async _getAvailableYears() {
        const timeSeries = await this._repository.load();
        const years = [...new Set(
            timeSeries.rows.map(row => new Date(row.period).getFullYear())
        )];
        return years.sort((a, b) => a - b);
    }

    _getImplementedModes() {
        return Object.keys(this._map);
    }

    _createModeCard(mode, config) {
        const button = document.createElement('button');
        button.dataset.mode = mode;
        button.className = 'flex flex-col text-left p-6 transition-all group';

        const isActive = mode === this._activeMode;
        if (isActive) {
            button.classList.add(...ACTIVE_CLASSES);
        } else {
            button.classList.add(...INACTIVE_CLASSES);
        }

        const iconColor = isActive ? 'text-on-primary-container' : 'text-primary';
        const trailingIcon = isActive ? 'check_circle' : 'arrow_forward';
        const trailingColor = isActive ? 'text-on-primary-container' : 'text-outline-variant group-hover:text-primary';
        const titleColor = isActive ? 'text-on-primary-container' : 'text-on-surface';
        const descColor = isActive ? 'text-on-primary-container/80' : 'text-on-surface-variant';

        button.innerHTML = `
            <div class="flex items-center justify-between w-full mb-3">
                <span class="material-symbols-outlined ${iconColor}">${config.icon}</span>
                <span class="material-symbols-outlined ${trailingColor}">${trailingIcon}</span>
            </div>
            <h3 class="font-headline-md text-[18px] font-bold ${titleColor} mb-1">${config.label}</h3>
            <p class="${descColor} text-[14px]">${config.description}</p>
        `;

        button.addEventListener('click', () => this._selectMode(mode));
        return button;
    }

    _selectMode(mode) {
        if (this._activeCard) {
            this._activeCard.className = 'flex flex-col text-left p-6 transition-all group';
            this._activeCard.classList.add(...INACTIVE_CLASSES);

            const prevConfig = this._map[this._activeMode];
            const prevIconColor = 'text-primary';
            const prevTrailing = this._activeCard.querySelector('.material-symbols-outlined:last-child');
            const prevTitle = this._activeCard.querySelector('h3');
            const prevDesc = this._activeCard.querySelector('p');

            if (prevTrailing) {
                prevTrailing.className = `material-symbols-outlined text-outline-variant group-hover:text-primary`;
                prevTrailing.textContent = 'arrow_forward';
            }
            this._activeCard.querySelector('.material-symbols-outlined:first-child').className = `material-symbols-outlined ${prevIconColor}`;
            if (prevTitle) prevTitle.className = `font-headline-md text-[18px] font-bold text-on-surface mb-1`;
            if (prevDesc) prevDesc.className = `text-on-surface-variant text-[14px]`;
        }

        this._activeMode = mode;
        const card = this._container.querySelector(`[data-mode="${mode}"]`);
        this._activeCard = card;

        card.className = 'flex flex-col text-left p-6 transition-all group';
        card.classList.add(...ACTIVE_CLASSES);

        const activeIconColor = 'text-on-primary-container';
        card.querySelector('.material-symbols-outlined:first-child').className = `material-symbols-outlined ${activeIconColor}`;
        const trailing = card.querySelector('.material-symbols-outlined:last-child');
        trailing.className = `material-symbols-outlined ${activeIconColor}`;
        trailing.textContent = 'check_circle';
        card.querySelector('h3').className = `font-headline-md text-[18px] font-bold text-on-primary-container mb-1`;
        card.querySelector('p').className = `text-on-primary-container/80 text-[14px]`;

        if (this._yearsSelect) {
            this._yearsSelect.style.display =
                this._map[mode]?.requiresYearSelector ? '' : 'none';
        }

        this._dispatchRequest();
    }

    async _createYearsSelector() {
        const years = await this._getAvailableYears();
        const select = document.createElement('select');
        select.className = 'mt-4 p-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md';

        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        });

        this._yearsSelect = select;
        return select;
    }

    _dispatchRequest() {
        if (!this._onRequest || !this._activeMode) return;
        const year = this._yearsSelect && this._yearsSelect.style.display !== 'none'
            ? Number(this._yearsSelect.value) : null;
        this._onRequest(new RequestModel(this._activeMode, year));
    }

    async render() {
        const wrapper = document.createElement('div');

        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'grid grid-cols-1 md:grid-cols-3 gap-6';

        const modes = this._getImplementedModes();
        this._activeMode = modes[0];

        modes.forEach(mode => {
            const card = this._createModeCard(mode, this._map[mode]);
            cardsContainer.appendChild(card);
        });

        wrapper.appendChild(cardsContainer);

        const yearsSelect = await this._createYearsSelector();
        yearsSelect.style.display = this._map[this._activeMode]?.requiresYearSelector ? '' : 'none';
        yearsSelect.addEventListener('change', () => this._dispatchRequest());
        wrapper.appendChild(yearsSelect);

        this._container.appendChild(wrapper);

        this._selectMode(this._activeMode);
    }
}
