from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse

class CustomExceptionHandler(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            print("-----Exception Handler-----",e)
            trace = []
            tb = e.__traceback__
            while tb is not None:
                trace.append({
                    "filename": tb.tb_frame.f_code.co_filename,
                    "name": tb.tb_frame.f_code.co_name,
                    "lineno": tb.tb_lineno
                })
                tb = tb.tb_next
            error_details = {
                'type': type(e).__name__,
                'message': str(e),
                'trace': trace
            }
            print(str(error_details))  # You can replace this with a logging statement
            return JSONResponse(status_code=500, content={"message": "Internal Server Error"})