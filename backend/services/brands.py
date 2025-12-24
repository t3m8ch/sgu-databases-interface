import uuid
from datetime import datetime

import asyncpg

from dto.brands import BrandCreateDTO, BrandDTO, BrandUpdateDTO


class BrandService:
    def __init__(self, conn: asyncpg.Connection):
        self.conn = conn

    async def get_all_brands(self) -> list[BrandDTO]:
        rows = await self.conn.fetch(
            "SELECT id, name, created_at, updated_at FROM brands"
        )
        return [BrandDTO(**row) for row in rows]

    async def get_brand(self, brand_id: uuid.UUID) -> BrandDTO | None:
        row = await self.conn.fetchrow(
            "SELECT id, name, created_at, updated_at FROM brands WHERE id = $1",
            brand_id,
        )
        return BrandDTO(**row) if row else None

    async def create_brand(self, data: BrandCreateDTO) -> BrandDTO:
        brand_id = uuid.uuid4()
        now = datetime.now()
        await self.conn.execute(
            "INSERT INTO brands (id, name, created_at, updated_at) VALUES ($1, $2, $3, $4)",
            brand_id,
            data.name,
            now,
            now,
        )
        return BrandDTO(id=brand_id, name=data.name, created_at=now, updated_at=now)

    async def update_brand(
        self, brand_id: uuid.UUID, data: BrandUpdateDTO
    ) -> BrandDTO | None:
        now = datetime.now()
        row = await self.conn.fetchrow(
            """
            UPDATE brands
            SET name = $1,
                updated_at = $2
            WHERE id = $3
            RETURNING id, name, created_at, updated_at
            """,
            data.name,
            now,
            brand_id,
        )
        return BrandDTO(**row) if row else None
