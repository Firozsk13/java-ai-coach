from enum import Enum
from pydantic import BaseModel ,Field
from typing import List

class DeleteFilesDTO(BaseModel):
    namespace_id: str 
    ids: List[str] = None
    names:List[str] = None

class DeleteFileDTO(BaseModel):
    namespace_id: str 
    id:  str= None
    name: str = None    

class CreateBot(BaseModel): 
    bot_name:str   
    description:str 

class conversation(BaseModel): 
    question: str
    Ai_response: str  
    
class ChatRequest(BaseModel): 
    question: str
    namespace_id: str    
    chatHistory:List[conversation] 

class UserLogin(BaseModel):  
    email:str  
    password:str 


class Roles(str,Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    KNOWLEDGE_OWNER = "KNOWLEDGE_OWNER" 
    
class UserRegister(BaseModel):  
    email:str  
    password:str  
    name:str  
    phone_number:int     
    company_name:str   
       
class UpdateUser(BaseModel):  
    _id:str
    email:str  
    name:str  
    phone_number:int     
    company_name:str 


class ResetPassword(BaseModel):  
    token:str  
    newPassword:str  
    confirmPassword:str    

class Status(str,Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
   
class Product(str,Enum):
    KNOWLEDGE_MANAGER = "KNOWLEDGE_MANAGER" 
    
    


       

  
 
     
