from litestar.connection import ASGIConnection
from litestar.exceptions import NotAuthorizedException
from litestar.handlers import BaseRouteHandler


def admin_guard(connection: ASGIConnection, _: BaseRouteHandler) -> None:
    session = connection.session
    if not session or session.get("role") != "admin":
        raise NotAuthorizedException("Access denied: Admin role required")
