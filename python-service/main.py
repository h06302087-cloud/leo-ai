# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# import subprocess
# import tempfile
# import os
# import sys
# import resource

# app = FastAPI(title="Leo AI Python Service", version="1.0.0")

# class ExecuteRequest(BaseModel):
#     script: str
#     inputs: dict = {}
#     timeout: int = 30
#     dependencies: list[str] = []

# class ValidateRequest(BaseModel):
#     script: str

# # Pre-installed libraries
# AVAILABLE_LIBRARIES = [
#     {"name": "pandas", "version": "2.2.0", "description": "Data manipulation and analysis"},
#     {"name": "numpy", "version": "1.26.0", "description": "Numerical computing"},
#     {"name": "requests", "version": "2.31.0", "description": "HTTP requests"},
#     {"name": "matplotlib", "version": "3.8.0", "description": "Plotting library"},
#     {"name": "scikit-learn", "version": "1.4.0", "description": "Machine learning"},
#     {"name": "Pillow", "version": "10.2.0", "description": "Image processing"},
# ]

# @app.get("/health")
# def health():
#     return {"status": "ok", "service": "python", "python_version": sys.version}

# @app.post("/api/python/execute")
# def execute(req: ExecuteRequest):
#     # Resource limits
#     max_memory = 512 * 1024 * 1024  # 512MB
#     max_cpu_time = req.timeout

#     # Create temporary file
#     with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
#         # Inject inputs as JSON
#         f.write(f"import json\n")
#         f.write(f"input_data = json.loads({json.dumps(json.dumps(req.inputs))})\n")
#         f.write(req.script)
#         tmp_path = f.name

#     try:
#         def set_limits():
#             resource.setrlimit(resource.RLIMIT_AS, (max_memory, max_memory))
#             resource.setrlimit(resource.RLIMIT_CPU, (max_cpu_time, max_cpu_time))

#         result = subprocess.run(
#             [sys.executable, tmp_path],
#             capture_output=True,
#             text=True,
#             timeout=req.timeout,
#             preexec_fn=set_limits,
#         )

#         return {
#             "success": result.returncode == 0,
#             "output": result.stdout,
#             "errors": result.stderr if result.stderr else None,
#             "exitCode": result.returncode,
#             "executionTime": None,  # Could measure with time module
#         }
#     except subprocess.TimeoutExpired:
#         raise HTTPException(status_code=408, detail="Script execution timed out")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
#     finally:
#         os.unlink(tmp_path)

# @app.post("/api/python/validate")
# def validate(req: ValidateRequest):
#     with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
#         f.write(req.script)
#         tmp_path = f.name

#     try:
#         result = subprocess.run(
#             [sys.executable, '-m', 'py_compile', tmp_path],
#             capture_output=True,
#             text=True,
#         )

#         return {
#             "success": result.returncode == 0,
#             "isValid": result.returncode == 0,
#             "errors": result.stderr if result.stderr else None,
#         }
#     finally:
#         os.unlink(tmp_path)

# @app.get("/api/python/libraries")
# def libraries(search: str = "", category: str = ""):
#     filtered = AVAILABLE_LIBRARIES
#     if search:
#         filtered = [lib for lib in filtered if search.lower() in lib["name"].lower()]
#     return {"success": True, "data": {"libraries": filtered}}

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 3006)))
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import tempfile
import os
import sys
import resource
import json  # <-- FIXED: Missing import

app = FastAPI(title="Leo AI Python Service", version="1.0.0")

class ExecuteRequest(BaseModel):
    script: str
    inputs: dict = {}
    timeout: int = 30
    dependencies: list[str] = []

class ValidateRequest(BaseModel):
    script: str

AVAILABLE_LIBRARIES = [
    {"name": "pandas", "version": "2.2.0", "description": "Data manipulation"},
    {"name": "numpy", "version": "1.26.0", "description": "Numerical computing"},
    {"name": "requests", "version": "2.31.0", "description": "HTTP requests"},
    {"name": "matplotlib", "version": "3.8.0", "description": "Plotting library"},
    {"name": "scikit-learn", "version": "1.4.0", "description": "Machine learning"},
    {"name": "Pillow", "version": "10.2.0", "description": "Image processing"},
]

@app.get("/health")
def health():
    return {"status": "ok", "service": "python", "python_version": sys.version}

@app.post("/api/python/execute")
def execute(req: ExecuteRequest):
    max_memory = 512 * 1024 * 1024  # 512MB
    max_cpu_time = req.timeout

    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        # Properly escape JSON string injections
        escaped_inputs = json.dumps(json.dumps(req.inputs))
        f.write("import json\n")
        f.write(f"input_data = json.loads({escaped_inputs})\n")
        f.write(req.script)
        tmp_path = f.name

    try:
        def set_limits():
            # Warning: RLIMIT_AS can cause issues with preloaded libraries in python
            resource.setrlimit(resource.RLIMIT_AS, (max_memory, max_memory))
            resource.setrlimit(resource.RLIMIT_CPU, (max_cpu_time, max_cpu_time))

        import time
        start_time = time.time()
        
        result = subprocess.run(
            [sys.executable, tmp_path],
            capture_output=True,
            text=True,
            timeout=req.timeout,
            preexec_fn=set_limits,
        )
        
        execution_time = time.time() - start_time

        return {
            "success": result.returncode == 0,
            "output": result.stdout,
            "errors": result.stderr if result.stderr else None,
            "exitCode": result.returncode,
            "executionTime": f"{execution_time:.3f}s",
        }
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Script execution timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.unlink(tmp_path)

@app.post("/api/python/validate")
def validate(req: ValidateRequest):
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(req.script)
        tmp_path = f.name

    try:
        result = subprocess.run(
            [sys.executable, '-m', 'py_compile', tmp_path],
            capture_output=True,
            text=True,
        )

        return {
            "success": result.returncode == 0,
            "isValid": result.returncode == 0,
            "errors": result.stderr if result.stderr else None,
        }
    finally:
        os.unlink(tmp_path)

@app.get("/api/python/libraries")
def libraries(search: str = "", category: str = ""):
    filtered = AVAILABLE_LIBRARIES
    if search:
        filtered = [lib for lib in filtered if search.lower() in lib["name"].lower()]
    return {"success": True, "data": {"libraries": filtered}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 3006)))
