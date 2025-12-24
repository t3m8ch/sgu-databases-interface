import asyncpg
from argon2 import PasswordHasher
from litestar import Litestar
from litestar.datastructures import State
from litestar.di import Provide
from litestar.middleware.session.server_side import ServerSideSessionConfig
from litestar.stores.memory import MemoryStore

from controllers.auth import AuthController
from controllers.brands import BrandController
from services.auth import AuthService
from services.brands import BrandService


async def provide_auth_service(state: State) -> AuthService:
    return AuthService(
        conn=state.conn, ph=state.ph, admin_username="admin", admin_password="admin"
    )


async def provide_brand_service(state: State) -> BrandService:
    return BrandService(conn=state.conn)


async def on_startup(app: Litestar):
    app.state.conn = await asyncpg.connect("postgresql://t3m8ch@localhost/batraevadb")
    app.state.ph = PasswordHasher()


session_store = MemoryStore()
session_config = ServerSideSessionConfig()


app = Litestar(
    route_handlers=[AuthController, BrandController],
    dependencies={
        "auth_service": Provide(provide_auth_service),
        "brand_service": Provide(provide_brand_service),
    },
    on_startup=[on_startup],
    middleware=[session_config.middleware],
    stores={"sessions": session_store},
)
