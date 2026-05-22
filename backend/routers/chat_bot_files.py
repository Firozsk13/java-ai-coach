from fastapi import APIRouter,UploadFile,File,BackgroundTasks,Form,Request,Depends
from models.dto import DeleteFileDTO,ChatRequest,CreateBot,DeleteFilesDTO
from typing import List
from services.chat_bot_files_service import ChatbotFilesService
from services.pinecone_service import PineconeService
from utils.helper import get_current_token 

router = APIRouter() 

pineconeService = PineconeService()
chatBotFileService = ChatbotFilesService(pineconeService)


@router.post("/fileUpload",dependencies=[Depends(get_current_token)])
async def upload(chatbot_id:str= Form(...),namespace_id: str= Form(...),files: List[UploadFile] = File(...),backgroundTasks: BackgroundTasks = None):
    return await chatBotFileService.upload_files(namespace_id,files,chatbot_id,backgroundTasks)

@router.get("",dependencies=[Depends(get_current_token)])
async def getFilesByChatBotId(chatBotId: str):
    return await chatBotFileService.getFilesByChatBotId(chatBotId)

@router.delete("/file",dependencies=[Depends(get_current_token)])
async def deleteFile(data:DeleteFileDTO,backgroundTasks: BackgroundTasks):
    return await chatBotFileService.delete_file(data,backgroundTasks)

@router.delete("",dependencies=[Depends(get_current_token)])
async def deleteFiles(data:DeleteFilesDTO,backgroundTasks: BackgroundTasks):
    return await chatBotFileService.delete_files(data,backgroundTasks)


 

 