async function loadTimeSeries(jsonPath) {
  const response = await fetch(jsonPath);
  const data = await response.json();
  return data;
}

const timeSeriesData = await loadTimeSeries('data/timeSeries.json');
console.log(timeSeriesData);
