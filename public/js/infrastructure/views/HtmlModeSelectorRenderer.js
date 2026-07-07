import { ModeSelectorPresenter } from "../../adapters/presenters/ModeSelectorPresenter.js";
import { dataVisualizationModeMap } from "../../adapters/controllers/DataVisualizationModeController.js";

export class HtmlModeSelectorRenderer extends ModeSelectorPresenter {
    constructor(containerSelector, repository, map = dataVisualizationModeMap) {
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

    render() {
        const modes = this._getImplementedModes();
        const select = document.createElement('select');

        modes.forEach(mode => {
            const option = document.createElement('option');
            option.value = mode;
            option.textContent = mode;
            select.appendChild(option);
        });

        this._container.innerHTML = '';
        this._container.appendChild(select);
    }

    async renderYears() {
        const years = await this._getAvaliableYears();
        const select = document.createElement('select');

        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        });

        this._container.appendChild(select);
    }
}