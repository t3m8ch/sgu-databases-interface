from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class BrandDTO:
    id: UUID
    name: str
    created_at: datetime
    updated_at: datetime


@dataclass
class BrandCreateDTO:
    name: str


@dataclass
class BrandUpdateDTO:
    name: str
