from datetime import datetime
import uuid
from fastapi import BackgroundTasks
from utils.success import error, result,success
from models.schemas import KnowledgeBot, User, ChatConversation
from dotenv import load_dotenv
from bson import ObjectId
from fastapi.responses import StreamingResponse

import os
import shutil
from config import constants
from bson import ObjectId
from utils.success import result, error
from models.schemas import KnowledgeBot
from utils.helper import is_java_related_query

load_dotenv()


class ChatBot:
    
    def __init__(self,pineconeService):
        self.pineconeService = pineconeService

    async def create(self,data,request,backgroundTasks:BackgroundTasks):
        id = request.state.user['id']
        user = User.objects(id = ObjectId(id)).first()
        if not user:
             return error('User Not Found')
        namespace_id = str(uuid.uuid4())  
        data_dict = data.dict()  
        data_dict['namespace_id'] = namespace_id
        data_dict['user_id'] = id 

        botData = KnowledgeBot(**data_dict)      
        botData.save()
        
        return result({"namespace_id": namespace_id}, "Congratulations, your created your bot")
    
    async def getBotByUserId(self,request):  
         id = request.query_params.get('id') if request.query_params.get('id') else request.state.user['id']
         items = KnowledgeBot.objects(user_id =ObjectId(id))

         return result([item.to_mongo().to_dict() for item in items])
        
    
    async def getBotById(self,id): 
         cursor = KnowledgeBot.objects(id = ObjectId(id))  
         return result(cursor.first().to_mongo().to_dict())
    
    # ******************************
    # 🔽 ADD THIS METHOD BELOW YOUR EXISTING METHODS
    async def delete_chatbot(self, bot_id: str):
        # 1️⃣ Find bot
        bot = KnowledgeBot.objects(id=ObjectId(bot_id)).first()
        if not bot:
            return error("Chatbot not found")

        namespace_id = bot.namespace_id

        # 2️⃣ Delete Pinecone namespace (IMPORTANT)
        try:
            await self.pineconeService.delete_namespace(namespace_id)
        except Exception as e:
            print("Pinecone delete error:", e)

        # 3️⃣ Delete uploaded files folder (IMPORTANT)
        upload_dir = os.path.join(constants.UPLOAD_DIR, namespace_id)
        if os.path.exists(upload_dir):
            shutil.rmtree(upload_dir, ignore_errors=True)

        # 4️⃣ Delete chatbot from MongoDB
        bot.delete()

        return result({}, "Chatbot deleted successfully")
      
    
    async def chat_conversation(self, data, request):  
            question = data.question
            namespace_id = data.namespace_id
            user_id = request.state.user['id']

            # Hard guard: this coach only answers Java-related questions
            if question and not is_java_related_query(question):
                async def stream_non_java():
                    yield "Please ask a Java-related query."
                return StreamingResponse(stream_non_java(), media_type="text/event-stream")
            
            # Get chatbot by namespace_id
            chatbot = KnowledgeBot.objects(namespace_id=namespace_id).first()
            if not chatbot:
                return error("Chatbot not found")
            
            chatbot_id = str(chatbot.id)
            
            chatHistory = ""
            # Only include last 5 conversations to prevent context overflow and repetition
            recent_history = data.chatHistory[-5:] if len(data.chatHistory) > 5 else data.chatHistory
            for chat in recent_history:
                # Only include question, not full response to prevent repetition
                if chat.question:
                    chatHistory += f"Previous Question: {chat.question}\n"
            
            # Stream response and collect it for saving
            full_response = ""
            
            async def collect_and_stream():
                nonlocal full_response
                async for chunk in self.pineconeService.chain_resp(namespace_id, question, chatHistory):
                    full_response += chunk
                    yield chunk
                
                # Save conversation after streaming completes
                try:
                    await self.save_conversation(
                        user_id=user_id,
                        chatbot_id=chatbot_id,
                        namespace_id=namespace_id,
                        question=question,
                        ai_response=full_response
                    )
                except Exception as e:
                    print(f"Error saving conversation: {e}")
            
            return StreamingResponse(collect_and_stream(), media_type="text/event-stream")
    
    async def save_conversation(self, user_id: str, chatbot_id: str, namespace_id: str, question: str, ai_response: str):
        """Save conversation to MongoDB"""
        try:
            conversation = ChatConversation(
                user_id=ObjectId(user_id),
                chatbot_id=ObjectId(chatbot_id),
                namespace_id=namespace_id,
                question=question,
                ai_response=ai_response
            )
            conversation.save()
            return True
        except Exception as e:
            print(f"Error saving conversation: {e}")
            return False
    
    async def get_conversations(self, user_id: str = None, chatbot_id: str = None, namespace_id: str = None):
        """Get conversations from MongoDB"""
        try:
            query = {}
            if user_id:
                query['user_id'] = ObjectId(user_id)
            if chatbot_id:
                query['chatbot_id'] = ObjectId(chatbot_id)
            if namespace_id:
                query['namespace_id'] = namespace_id
            
            conversations = ChatConversation.objects(**query).order_by('-created_at')
            return result([conv.to_mongo().to_dict() for conv in conversations])
        except Exception as e:
            print(f"Error getting conversations: {e}")
            return error(f"Error getting conversations: {str(e)}")
    
