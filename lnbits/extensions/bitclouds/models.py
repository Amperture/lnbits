from sqlite3 import Row
from typing import NamedTuple


class Instance(NamedTuple):
    id: str
    wallet: str
    name: str
    image: str
    expiry: int


    @classmethod
    def from_row(cls, row: Row) -> "Instance":
        return cls(**dict(row))
