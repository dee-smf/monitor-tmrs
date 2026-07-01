/**
 * @module ui/yearSelector
 * Manages the year filter dropdown. Populates it with available years
 * so the user can select which year to display in the YTD view.
 */
export class YearSelector {
    /**
     * Populate the year select element with option tags.
     * Clears any existing options before re-populating.
     * @param {number[]} availableYears - Years to show (typically sorted descending).
     * @param {string} [containerId='yearSelector'] - ID of the select element.
     */
    setup(availableYears, containerId = 'yearSelector') {
        const select = document.getElementById(containerId);
        select.innerHTML = '';
        availableYears.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        });
    }
}
