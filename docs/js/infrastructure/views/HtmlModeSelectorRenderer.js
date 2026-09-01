import { ModeSelectorPresenter } from "../../adapters/presenters/ModeSelectorPresenter.js";
import { RequestModel } from "../../application/UseCaseInterface.js";

const STYLES = {
    card: 'flex flex-col text-left p-6 transition-all group min-w-[120px] flex-1',
    activeCardClasses: ['bg-primary-container', 'border', 'border-primary', 'rounded-lg', 'shadow-sm'],
    inactiveCardClasses: ['bg-surface-container-lowest', 'border', 'border-outline-variant', 'rounded-lg', 'hover:border-primary', 'hover:shadow-md'],
    iconRow: 'flex items-center justify-between w-full mb-3',
    icon: 'material-symbols-outlined',
    activeIconColor: 'text-on-primary-container',
    inactiveIconColor: 'text-primary',
    inactiveTrailingColor: 'text-outline-variant group-hover:text-primary',
    title: 'font-headline-md text-[18px] font-bold',
    activeTitleColor: 'text-on-primary-container',
    inactiveTitleColor: 'text-on-surface',
    titleSpacing: 'mb-1',
    description: 'text-[14px]',
    activeDescColor: 'text-on-primary-container/80',
    inactiveDescColor: 'text-on-surface-variant',
    yearsWrapper: 'mt-4 flex items-center gap-3',
    yearLabel: 'text-on-surface font-body-md text-body-md font-medium',
    yearSelect: 'py-2.5 pl-3 pr-10 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md',
    checkboxWrapper: 'flex items-center gap-2 ml-4',
    checkbox: 'w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary',
    checkboxLabel: 'text-on-surface font-body-md text-body-md font-medium cursor-pointer',
    cardsContainer: 'flex flex-wrap gap-6',
};

const MODE_CONFIG = {
    RESULT:                { label: 'Resultado mensal',          icon: 'calendar_month', description: 'Arrecadação, Despesa e Resultado em cada mês disponível.',          defaultYear: null  },
    ROLLING_12_PERIOD_SUM: { label: 'Resultado em 12 meses',     icon: 'history',        description: 'Evolução do Resultado em 12 meses para cada mês disponível.',              defaultYear: null  },
    CUM_SUM_BY_YEAR:       { label: 'Acumulado no ano',          icon: 'query_stats',    description: 'Evolução do Resultado de maneira acumulada ao longo do período.',     defaultYear: 'latest' },
};

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
        this._detailCheckbox = null;
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
        button.className = STYLES.card;

        const isActive = mode === this._activeMode;
        if (isActive) {
            button.classList.add(...STYLES.activeCardClasses);
        } else {
            button.classList.add(...STYLES.inactiveCardClasses);
        }

        const iconColor = isActive ? STYLES.activeIconColor : STYLES.inactiveIconColor;
        const trailingIcon = isActive ? 'check_circle' : 'arrow_forward';
        const trailingColor = isActive ? STYLES.activeIconColor : STYLES.inactiveTrailingColor;
        const titleColor = isActive ? STYLES.activeTitleColor : STYLES.inactiveTitleColor;
        const descColor = isActive ? STYLES.activeDescColor : STYLES.inactiveDescColor;

        button.innerHTML = `
            <div class="${STYLES.iconRow}">
                <span class="${STYLES.icon} ${iconColor}">${config.icon}</span>
                <span class="${STYLES.icon} ${trailingColor}">${trailingIcon}</span>
            </div>
            <h3 class="${STYLES.title} ${titleColor} ${STYLES.titleSpacing}">${config.label}</h3>
            <p class="${descColor} ${STYLES.description}">${config.description}</p>
        `;

        button.addEventListener('click', () => this._selectMode(mode));
        return button;
    }

    _selectMode(mode) {
        if (this._activeCard) {
            this._activeCard.className = STYLES.card;
            this._activeCard.classList.add(...STYLES.inactiveCardClasses);

            const prevTrailing = this._activeCard.querySelector('.material-symbols-outlined:last-child');
            const prevTitle = this._activeCard.querySelector('h3');
            const prevDesc = this._activeCard.querySelector('p');

            if (prevTrailing) {
                prevTrailing.className = `${STYLES.icon} ${STYLES.inactiveTrailingColor}`;
                prevTrailing.textContent = 'arrow_forward';
            }
            this._activeCard.querySelector('.material-symbols-outlined:first-child').className = `${STYLES.icon} ${STYLES.inactiveIconColor}`;
            if (prevTitle) prevTitle.className = `${STYLES.title} ${STYLES.inactiveTitleColor} ${STYLES.titleSpacing}`;
            if (prevDesc) prevDesc.className = `${STYLES.inactiveDescColor} ${STYLES.description}`;
        }

        this._activeMode = mode;
        const card = this._container.querySelector(`[data-mode="${mode}"]`);
        this._activeCard = card;

        card.className = STYLES.card;
        card.classList.add(...STYLES.activeCardClasses);

        card.querySelector('.material-symbols-outlined:first-child').className = `${STYLES.icon} ${STYLES.activeIconColor}`;
        const trailing = card.querySelector('.material-symbols-outlined:last-child');
        trailing.className = `${STYLES.icon} ${STYLES.activeIconColor}`;
        trailing.textContent = 'check_circle';
        card.querySelector('h3').className = `${STYLES.title} ${STYLES.activeTitleColor} ${STYLES.titleSpacing}`;
        card.querySelector('p').className = `${STYLES.activeDescColor} ${STYLES.description}`;

        if (this._yearsSelect) {
            const select = this._yearsSelect.querySelector('select');
            const defaultYear = this._map[mode]?.defaultYear;
            if (defaultYear === 'latest') {
                select.options[select.options.length - 1].selected = true;
            } else {
                select.options[0].selected = true;
            }
        }

        this._dispatchRequest();
    }

    async _createYearsSelector() {
        const years = await this._getAvailableYears();

        const wrapper = document.createElement('div');
        wrapper.className = STYLES.yearsWrapper;

        const label = document.createElement('label');
        label.textContent = 'Selecione o ano:';
        label.className = STYLES.yearLabel;
        wrapper.appendChild(label);

        const select = document.createElement('select');
        select.className = STYLES.yearSelect;

        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = 'Todos os períodos';
        select.appendChild(allOption);

        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        });

        wrapper.appendChild(select);

        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = STYLES.checkboxWrapper;
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'detail-expenses';
        checkbox.className = STYLES.checkbox;
        const checkboxLabel = document.createElement('label');
        checkboxLabel.htmlFor = 'detail-expenses';
        checkboxLabel.textContent = 'Detalhar despesas';
        checkboxLabel.className = STYLES.checkboxLabel;
        checkboxWrapper.appendChild(checkbox);
        checkboxWrapper.appendChild(checkboxLabel);
        wrapper.appendChild(checkboxWrapper);

        this._detailCheckbox = checkbox;
        checkbox.addEventListener('change', () => this._dispatchRequest());

        this._yearsSelect = wrapper;
        this._yearsSelect._select = select;
        return wrapper;
    }

    _dispatchRequest() {
        if (!this._onRequest || !this._activeMode) return;
        const select = this._yearsSelect?._select;
        const year = select && select.value !== '' ? Number(select.value) : null;
        const detailExpenses = this._detailCheckbox ? this._detailCheckbox.checked : false;
        this._onRequest(new RequestModel(this._activeMode, year, detailExpenses));
    }

    async render() {
        const wrapper = document.createElement('div');

        const cardsContainer = document.createElement('div');
        cardsContainer.className = STYLES.cardsContainer;
        cardsContainer.dataset.cards = 'mode-selector';

        const modes = this._getImplementedModes();
        this._activeMode = modes[0];

        modes.forEach(mode => {
            const card = this._createModeCard(mode, this._map[mode]);
            cardsContainer.appendChild(card);
        });

        wrapper.appendChild(cardsContainer);

        const yearsSelect = await this._createYearsSelector();
        yearsSelect._select.addEventListener('change', () => this._dispatchRequest());
        wrapper.appendChild(yearsSelect);

        this._container.appendChild(wrapper);

        this._selectMode(this._activeMode);
    }
}
