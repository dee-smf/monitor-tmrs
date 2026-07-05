import { DataOperation } from '../DataOperation.js';
import { TimeSeriesDto } from '../TimeSeriesDto.js';

export class Rolling12PeriodSumOperation extends DataOperation {
  execute(dto) {
    if (dto.rows.length < 12) return new TimeSeriesDto([]);

    const numericKeys = Object.keys(dto.rows[0]).filter(
      key => typeof dto.rows[0][key] === 'number' && key !== 'period'
    );

    const rows = dto.rows.slice(11).map((row, i) => {
      const window = dto.rows.slice(i, i + 12);
      const aggregated = { period: row.period };
      for (const key of numericKeys) {
        aggregated[key] = window.reduce((acc, r) => acc + r[key], 0);
      }
      return aggregated;
    });

    return new TimeSeriesDto(rows);
  }
}
