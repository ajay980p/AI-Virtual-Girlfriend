from fastapi import APIRouter

router = APIRouter()


@router.get("/ping")
def test():
    return {"msg": "pong"}


@router.get("/me")
def get_me():
    return {"message": "This is the user endpoint"}