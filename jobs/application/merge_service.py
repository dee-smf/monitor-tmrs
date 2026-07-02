from pandas import DataFrame


class MergeService:
    def merge(self, datasets: list[DataFrame]) -> DataFrame:
        if not datasets:
            return DataFrame()
        result: DataFrame = datasets[0]
        for df in datasets[1:]:
            result = result.merge(df, on='period', how='inner')
        return result
