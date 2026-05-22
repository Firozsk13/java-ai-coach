def handleExceptions(task_func):
    async def wrapper(*args, **kwargs):
        try:
            return await task_func(*args, **kwargs)  # Call the actual function asynchronously
        except Exception as e:
            print("-----Background Exception------")
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
            print(str(error_details))  # Replace this with a logging statement
        return None  # Return None or appropriate default if an exception occurs
    return wrapper  # Return the wrapper function itself, NOT calling it recursively
