def process_video(file_bytes: bytes, filename: str, content_type: str):
# Stub — ready for scene detection / captioning
   return {
   "type": "video",
   "filename": filename,
   "size_bytes": len(file_bytes),
   "content_type": content_type,
   "scenes": [], # fill with [{start, end, description}]
   "captions": None,
   "notes": "Video analysis not enabled in MVP. Integrate PySceneDetect + captioning here.",
   }