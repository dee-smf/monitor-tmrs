export function setupYearSelector(availableYears, containerId = 'yearSelector') {
    const select = document.getElementById(containerId);
    select.innerHTML = '';
    availableYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
    });
};
