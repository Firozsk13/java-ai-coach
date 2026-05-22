# from fastapi import APIRouter,UploadFile,File,BackgroundTasks,Form
# from models.dto import ResetPassword, UpdateUser, UserLogin,UserRegister
# from services.user_service import UserQueries

from fastapi import APIRouter,UploadFile,File,BackgroundTasks,Form, Depends
from models.dto import ResetPassword, UpdateUser, UserLogin,UserRegister
from services.user_service import UserQueries
from fastapi.security import HTTPBearer
router = APIRouter() 

userQueries = UserQueries()
security = HTTPBearer()

@router.post("/register")
async def create(data:UserRegister):
    return await userQueries.register_user(data)

@router.post("/login")
async def login(data:UserLogin):
    return await userQueries.login(data)

 
@router.get("", dependencies=[Depends(security)])
async def getAll():
    return await userQueries.get_all_users()

 
@router.get("/{id}", dependencies=[Depends(security)])
async def getById(id:str):
    return await userQueries.get_user_by_id(id)
# router = APIRouter() 

# userQueries = UserQueries()

# @router.post("/register")
# async def create(data:UserRegister):
#     return await userQueries.register_user(data)

# @router.post("/login")
# async def login(data:UserLogin):
#     return await userQueries.login(data)

 
# @router.get("")
# async def getAll():
#     return await userQueries.get_all_users()

 
# @router.get("/:id")
# async def getById(id:str):
#     return await userQueries.get_user_by_id(id)
 


 