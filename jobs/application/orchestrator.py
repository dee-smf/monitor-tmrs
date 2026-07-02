from pandas import DataFrame

from application.merge_service import MergeService
from sources.source_base import DataSource


class Orchestrator:
    def __init__(self, sources: list[DataSource], merge_service: MergeService) -> None:
        self._sources: list[DataSource] = sources
        self._merge_service: MergeService = merge_service

    def run(self, periods: list[int]) -> DataFrame:
        transformed: list[DataFrame] = []
        for source in self._sources:
            raw: DataFrame = source.load_raw(periods)
            result: DataFrame = source.transform(raw)
            transformed.append(result)
        return self._merge_service.merge(transformed)
