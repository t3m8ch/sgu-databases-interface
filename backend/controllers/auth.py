from litestar import Controller, Request, Response, post
from litestar.dto.dataclass_dto import DataclassDTO

from dto.auth import LoginDTO, RegisterDTO
from services.auth import AuthService


class AuthController(Controller):
    path = "/auth"

    @post(dto=DataclassDTO[LoginDTO], path="/login")
    async def login(
        self, data: LoginDTO, request: Request, auth_service: AuthService
    ) -> dict[str, str]:
        session = await auth_service.login(data)
        request.set_session(session)
        return {"message": "Login successful"}

    @post(dto=DataclassDTO[RegisterDTO], path="/register")
    async def register(self, data: RegisterDTO, auth_service: AuthService) -> Response:
        await auth_service.register(data)
        return Response(status_code=201, content={"message": "Registration successful"})

    @post("/logout")
    async def logout(self, request: Request) -> dict[str, str]:
        request.session.clear()
        return {"message": "Logged out successfully"}
