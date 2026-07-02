from dataclasses import dataclass


Period = int


@dataclass(frozen=True)
class RawFileRecord:
    source_id: str
    period: int
    path: str
