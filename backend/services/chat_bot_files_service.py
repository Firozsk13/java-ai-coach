from bson import ObjectId
from fastapi import  BackgroundTasks
from models.schemas import KnowledgeBotFiles
from utils.helper import save_uploaded_file
from utils.success import error, result, success


class ChatbotFilesService:
    
    def __init__(self,pineconeService):
        self.pineconeService=pineconeService
        
    async def upload_files(self,namespace_id,files,chatbot_id,backgroundTasks:BackgroundTasks):
        if len(files):
            for file in files: 
                save_uploaded_file(file, namespace_id)
                createdObj = {
                'name':file.filename,
                "namespace_id":namespace_id,
                "chatbot_id":chatbot_id,
                "size":file.size,
                }
                data = KnowledgeBotFiles(**createdObj)
                data.save()
                backgroundTasks.add_task(self.pineconeService.vectorize_documents_main,namespace_id)
            

        return success(f"Total {len(files)} files uploaded successfully!")
    
    async def getFilesByChatBotId(self,chatBotId): 
         items = KnowledgeBotFiles.objects(chatbot_id = ObjectId(chatBotId))
         return result([item.to_mongo().to_dict() for item in items]) 
        
    
    async def delete_files(self,data,backgroundTasks:BackgroundTasks): 
            reqObj={
             "ids":data.ids,
             "names":data.names,
             "namespace_id":data.namespace_id
            } 
            
            object_ids = [ObjectId(id) for id in reqObj['ids']] 
            result = KnowledgeBotFiles.objects(id__in=object_ids).delete()
            backgroundTasks.add_task(self.pineconeService.delete_vectorized_docs,reqObj['namespace_id'],"name",reqObj['names'])
            return success("File deleted Successfully!")
    
    async def delete_file(self,data,backgroundTasks:BackgroundTasks): 
        
            reqObj={
             "id":data.id,
             "name":data.name,
             "namespace_id":data.namespace_id
            }  
            
            result = KnowledgeBotFiles.objects(id=ObjectId(reqObj['id'])).delete()
            backgroundTasks.add_task(self.pineconeService.delete_vectorized_docs,reqObj['namespace_id'],"name",[reqObj['name']])
            if result == 0:
                return error(f"Item with ID {reqObj['id']} deleted successfully")
            else:
                return success("File deleted Successfully!")
        
    