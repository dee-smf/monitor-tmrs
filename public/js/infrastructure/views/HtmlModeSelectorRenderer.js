import { ModeSelectorPresenter } from "../../adapters/presenters/ModeSelectorPresenter.js";
import { dataVisualizationModeMap } from "../../adapters/controllers/DataVisualizationModeController.js";

const MODE_CONFIG = {
    CUM_SUM_BY_YEAR:       { label: 'Soma Acumulada por Ano',          requiresYearSelector: true  },
    RESULT:                { label: 'Resultado (Receitas - Despesas)', requiresYearSelector: false },
    ROLLING_12_PERIOD_SUM: { label: 'Média Móvel 12 Meses',           requiresYearSelector: false },
};

export class HtmlModeSelectorRenderer extends ModeSelectorPresenter {
    constructor(containerSelector, repository, map = MODE_CONFIG) {
        super();
        this._container = document.querySelector(containerSelector);
        this._repository = repository;
        this._map = map;
    }

    async _getAvaliableYears() {
        const timeSeries = await this._repository.load();
        const years = [...new Set(
            timeSeries.rows.map(row => new Date(row.period).getFullYear())
        )];
        return years.sort((a, b) => a - b);
    }

    _getImplementedModes() {
        return Object.keys(this._map);
    }

    _createModesSelector() {
        const modes = this._getImplementedModes();
        const select = document.createElement('select');

        modes.forEach(mode => {
            const option = document.createElement('option');
            option.value = mode;
            option.textContent = this._map[mode].label;
            select.appendChild(option);
        });

        return select;
    }

    async _createYearsSelector() {
        const years = await this._getAvaliableYears();
        const select = document.createElement('select');

        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        });

        return select;
    }

    async render() {
        const wrapper = document.createElement('div');

        const modesSelect = this._createModesSelector();
        wrapper.appendChild(modesSelect);

        const yearsSelect = await this._createYearsSelector();
        const toggleYears = () => {
            yearsSelect.style.display =
                this._map[modesSelect.value]?.requiresYearSelector ? '' : 'none';
        };
        toggleYears();
        modesSelect.addEventListener('change', toggleYears);
        wrapper.appendChild(yearsSelect);

        this._container.appendChild(wrapper);
    }
}