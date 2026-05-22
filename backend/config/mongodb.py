from mongoengine import connect
import os

def init_db():
    client = connect(host=os.getenv("MONGODB_URL"),db=os.getenv("DB"))
    

    