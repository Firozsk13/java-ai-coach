from fastapi import APIRouter,UploadFile,File,BackgroundTasks,Form,Request,Depends
from models.dto import DeleteFileDTO,ChatRequest,CreateBot,DeleteFilesDTO
from services.chat_bot_service import ChatBot
from typing import List
from services.pinecone_service import PineconeService
from utils.helper import get_current_token 

router = APIRouter() 

pineconeService = PineconeService()
chatBotService = ChatBot(pineconeService)



@router.delete("/chatbot/{bot_id}")
async def delete_chatbot(bot_id: str):
    return await chatBotService.delete_chatbot(bot_id)


@router.post("",dependencies=[Depends(get_current_token)])
async def create(data:CreateBot,request: Request,backgroundTasks: BackgroundTasks = None):
    return await chatBotService.create(data,request,backgroundTasks)

@router.get("/all",dependencies=[Depends(get_current_token)])
async def getBotByUserId(request: Request):
    return await chatBotService.getBotByUserId(request)


@router.post("/chat",dependencies=[Depends(get_current_token)])
async def chatConversation(data: ChatRequest, request: Request):
    return await chatBotService.chat_conversation(data, request)

@router.get("/conversations",dependencies=[Depends(get_current_token)])
async def getConversations(request: Request, chatbot_id: str = None, namespace_id: str = None):
    user_id = request.state.user['id']
    return await chatBotService.get_conversations(user_id=user_id, chatbot_id=chatbot_id, namespace_id=namespace_id)

@router.post("/save-conversation",dependencies=[Depends(get_current_token)])
async def saveConversation(data: dict, request: Request):
    user_id = request.state.user['id']
    return await chatBotService.save_conversation(
        user_id=user_id,
        chatbot_id=data.get('chatbot_id'),
        namespace_id=data.get('namespace_id'),
        question=data.get('question'),
        ai_response=data.get('ai_response')
    )

@router.get("/{id}",dependencies=[Depends(get_current_token)])
async def getBotById(id: str):
    return await chatBotService.getBotById(id)



 