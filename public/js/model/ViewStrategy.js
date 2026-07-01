class ViewSelection {
  constructor({ displayData, chartType, showYearSelector, chartTitle, tableTitle }) {
    this.displayData = displayData;
    this.chartType = chartType;
    this.showYearSelector = showYearSelector;
    this.chartTitle = chartTitle;
    this.tableTitle = tableTitle;
  }
}

class ViewStrategy {
  selectData(processedData, selectedYear) {
    throw new Error('Abstract method — subclass must implement');
  }
}

class SimpleViewStrategy extends ViewStrategy {
  selectData(processedData) {
    return new ViewSelection({
      displayData: processedData.simple,
      chartType: 'bar',
      showYearSelector: false,
      chartTitle: 'Arrecadação e Despesas Mensais',
      tableTitle: 'Extrato Mensal',
    });
  }
}

class Rolling12ViewStrategy extends ViewStrategy {
  selectData(processedData) {
    return new ViewSelection({
      displayData: processedData.rolling12,
      chartType: 'line',
      showYearSelector: false,
      chartTitle: 'Acumulado (Últimos 12 Meses)',
      tableTitle: 'Extrato Acumulado (12m)',
    });
  }
}

class YtdViewStrategy extends ViewStrategy {
  selectData(processedData, selectedYear) {
    const displayData = processedData.ytd.filter(d => d.year === selectedYear);
    return new ViewSelection({
      displayData,
      chartType: 'line',
      showYearSelector: true,
      chartTitle: `Acumulado no Exercício (${selectedYear})`,
      tableTitle: `Extrato do Exercício (${selectedYear})`,
    });
  }
}

const STRATEGIES = {
  simple: new SimpleViewStrategy(),
  rolling12: new Rolling12ViewStrategy(),
  ytd: new YtdViewStrategy(),
};

export class ViewStrategyFactory {
  static getStrategy(mode) {
    return STRATEGIES[mode];
  }
}
