from uuid import UUID

from litestar import Controller, Response, get, post, put
from litestar.dto.dataclass_dto import DataclassDTO

from dto.brands import BrandCreateDTO, BrandDTO, BrandUpdateDTO
from guards.admin import admin_guard
from services.brands import BrandService


class BrandController(Controller):
    path = "/brands"
    guards = [admin_guard]

    @get()
    async def get_all_brands(self, brand_service: BrandService) -> list[BrandDTO]:
        return await brand_service.get_all_brands()

    @post(dto=DataclassDTO[BrandCreateDTO])
    async def create_brand(
        self, data: BrandCreateDTO, brand_service: BrandService
    ) -> BrandDTO:
        return await brand_service.create_brand(data)

    @get("/{brand_id:uuid}")
    async def get_brand(
        self, brand_id: UUID, brand_service: BrandService
    ) -> BrandDTO | Response:
        brand = await brand_service.get_brand(brand_id)
        if not brand:
            return Response(status_code=404, content={"message": "Brand not found"})
        return brand

    @put("/{brand_id:uuid}", dto=DataclassDTO[BrandUpdateDTO])
    async def update_brand(
        self, brand_id: UUID, data: BrandUpdateDTO, brand_service: BrandService
    ) -> BrandDTO | Response:
        brand = await brand_service.update_brand(brand_id, data)
        if not brand:
            return Response(status_code=404, content={"message": "Brand not found"})
        return brand
