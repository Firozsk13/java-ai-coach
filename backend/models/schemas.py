from enum import Enum
from typing import Any
from models.dto import Product, Roles, Status
from datetime import datetime, timedelta
from mongoengine import Document, StringField, signals, ReferenceField,DateTimeField,IntField,ObjectIdField
import bcrypt

from utils.jwt import JwtHandler

# Mongo Schema Creation

class User(Document): 
        name=StringField(required=True)
        email=StringField(required=True)
        password=StringField(required=True)
        phone_number= IntField(required=True)
        company_name=StringField() 
        status:Status= StringField(default=Status.ACTIVE)  
        role: Roles = StringField(default=Roles.KNOWLEDGE_OWNER)  
        product:Product = StringField(default=Product.KNOWLEDGE_MANAGER)
        
        meta = {'collection': 'user'}
            # Pre-save signal for password encryption
        @classmethod
        def pre_save(cls, sender, document, **kwargs):
            # Check if the password is already hashed to avoid rehashing
            if not document.password.startswith("$2b$"):
                document.password = bcrypt.hashpw(document.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            print(f"Pre-save: Password encrypted for {document.email}")

        # Method to compare a plain-text password with the hashed password
        def check_password(self, plain_password: str) -> bool:
            return bcrypt.checkpw(plain_password.encode('utf-8'), self.password.encode('utf-8'))
        
        def generate_token(self,payload:object) -> str:
            return JwtHandler.encode(payload, timedelta(hours=12) )

# Connect the pre_save signal to the User class
signals.pre_save.connect(User.pre_save, sender=User)


class KnowledgeBot(Document): 
    # id = ObjectIdField(primary_key=True)
    meta = {'collection': 'knowledgeBot'}
    user_id= ReferenceField(User)
    bot_name= StringField(required=True) 
    namespace_id= StringField(required=True)
    description=StringField() 
    created_at= DateTimeField(default=datetime.utcnow)
    

class KnowledgeBotFiles(Document): 
    # id = ObjectIdField(primary_key=True)
    meta = {'collection': 'knowledgeBotFiles'}
    name = StringField(required=True) 
    namespace_id = StringField(required=True) 
    chatbot_id= ReferenceField(KnowledgeBot)
    size = IntField(required=True)  
    createdAt = DateTimeField(default=datetime.utcnow)

class ChatConversation(Document):
    meta = {'collection': 'chatConversations'}
    user_id = ReferenceField(User, required=True)
    chatbot_id = ReferenceField(KnowledgeBot, required=True)
    namespace_id = StringField(required=True)
    question = StringField(required=True)
    ai_response = StringField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)

   
        