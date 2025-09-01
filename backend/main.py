from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from processors.text_processor import process_text
from processors.image_processor import process_image
from processors.audio_processor import process_audio
from processors.video_processor import process_video

# Import your auth dependency
from auth import verify_token   # make sure auth.py exists as explained before

app = FastAPI(title="Multimodal Ingest API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",   # your frontend
        "http://127.0.0.1:5173","https://data-ingestor-egac7x5zs-arpit-dhumanes-projects.vercel.app" ],
    allow_credentials=True,
    allow_methods=["*"],    
    allow_headers=["*"],
)

class ResponseModel(BaseModel):
   type: str
   metadata: dict
   result: dict

@app.post("/api/process")
async def process_endpoint(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    user: dict = Depends(verify_token)   
):
    print("Authenticated user:", user.get("email"))
    metadata = {"user": user.get("sub")}  
    result = {}

    if text and not file:
        result = process_text(text)
        metadata["source"] = "text"
    elif file:
        content = await file.read()
        content_type = file.content_type or "application/octet-stream"
        filename = file.filename
        metadata.update({"source": "file", "filename": filename, "content_type": content_type})

        if content_type.startswith("image/"):
            result = process_image(content, filename)
        elif content_type.startswith("audio/"):
            result = process_audio(content, filename, content_type)
        elif content_type.startswith("video/"):
            result = process_video(content, filename, content_type)
        else:
            try:
                text_content = content.decode("utf-8")
                result = process_text(text_content)
            except Exception:
                result = {
                    "type": "binary",
                    "filename": filename,
                    "size_bytes": len(content),
                    "content_type": content_type,
                }
    else:
        return {"error": "Provide text or a file."}

    return {"type": result.get("type"), "metadata": metadata, "result": result}


@app.get("/api/health")
async def health():
    return {"ok": True}

@app.post("/update-role")
def update_role(user_id: str, user: dict = Depends(verify_token)):
    try:
        response = supabase.auth.admin.update_user_by_id(user_id, {
            "app_metadata": {
                "role": "admin",
                "beta_user": True
            }
        })
        return {"success": True, "updated": response}
    except Exception as e:
        return {"success": False, "error": str(e)}

