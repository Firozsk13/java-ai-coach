from fastapi import status
from fastapi.responses import JSONResponse
from bson import json_util
import json

def success(message:str ):
   response_content = {"message": message}  
   return JSONResponse(content=response_content, status_code=status.HTTP_200_OK)

def result(data:object ,message:str=None):
   response_content = {"result":json.loads(json_util.dumps(data)),"message":message}  
   return JSONResponse(content=response_content, status_code=status.HTTP_200_OK)

def invalid_input(message:str ):
   response_content = {"message": message}  
   return JSONResponse(content=response_content, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

def error(message:str ):
   response_content = {"message": message}  
   return JSONResponse(content=response_content, status_code=status.HTTP_400_BAD_REQUEST)

def un_authorized(message:str):
   response_content = {"message": message}  
   return JSONResponse(content=response_content, status_code=status.HTTP_401_UNAUTHORIZED,headers={"Access-Control-Allow-Origin": "*"})
