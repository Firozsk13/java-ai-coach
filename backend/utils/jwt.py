from typing import Optional
import jwt
import os 
import json
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from bson import ObjectId,json_util
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from utils.success import un_authorized



class JwtHandler():
      
      @staticmethod
      def encode(data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()

        # Fetch the expiration time from the environment and convert it to an integer
        expiration_minutes = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")  # Default to 30 minutes
        try:
            expiration_minutes = int(expiration_minutes)  # Convert string to integer
        except ValueError:
            raise ValueError(f"Invalid value for ACCESS_TOKEN_EXPIRE_MINUTES: {expiration_minutes}")
        
        # Set expiration time
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
            to_encode.update({"exp": expire})
            
        # else:
        #     expire = datetime.utcnow() + timedelta(minutes=expiration_minutes)


        # Encode the JWT token
        encoded_jwt = jwt.encode(to_encode, os.getenv('JWT_SECRET'), algorithm=os.getenv('JWT_ALGO'))
        return encoded_jwt
            # return  jwt.encode(json.loads(json_util.dumps({'_id':id})),os.getenv('JWT_SECRET'),os.getenv('JWT_ALGO'))
      
      @staticmethod
      def decode(token): 
            try:
                # Decode the token and check if it's valid
                payload = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=[os.getenv('JWT_ALGO')])
                # You can also manually check if the expiration time is in the future
            #     if datetime.utcfromtimestamp(payload["exp"]) < datetime.utcnow():
            #         return JSONResponse(
            #     status_code=status.HTTP_401_UNAUTHORIZED,
            #     content={"message":"Token is Expired"},
            # )
                return payload
            except jwt.ExpiredSignatureError:
                # Token is expired
                return {"message":"Token is Expired"}
            #     return JSONResponse(
            #     status_code=status.HTTP_401_UNAUTHORIZED,
            #     content={"message":"Token is Expired"},
            # )
            except jwt.PyJWTError:
                # Token is invalid in any other way
                return {"message":"Invalid Token"}

            #     return JSONResponse(
            #     status_code=status.HTTP_401_UNAUTHORIZED,
            #     content={"message":"Invalid Token"},
            # )
        #   return jwt.decode(token, key=os.getenv('JWT_SECRET'), algorithms=os.getenv('JWT_ALGO'))

         


class JwtMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, exempt_routes=None):
        super().__init__(app)
        self.exempt_routes = exempt_routes or [] 

    async def dispatch(self, request, call_next):
      
        print(request.url.path)

        if request.method == "OPTIONS":
            return await call_next(request)
        if request.url.path in self.exempt_routes:
            return await call_next(request)
        auth_header = request.headers.get("authorization") 
        # print("auth_header--",request.headers)
        if not auth_header:
            return JSONResponse(
                content={"message":"Authorization token is missing"},
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        
     
            
        token = auth_header.split(" ")[1] if auth_header.startswith("Bearer ") else auth_header
        decoded_token = JwtHandler.decode(token)
        if "message" in decoded_token:
            print('decoded_token', decoded_token["message"])
            # return JSONResponse(content={"message": decoded_token['message']},
            #                      status_code=status.HTTP_401_UNAUTHORIZED)

            return un_authorized(f"{decoded_token['message']}")
        
    
        request.state.user = decoded_token  # Attach decoded token to request
        return await call_next(request)         