def process_audio(file_bytes: bytes, filename: str, content_type: str):
# Stub — ready for Whisper or other ASR integration
   return {
   "type": "audio",
   "filename": filename,
   "size_bytes": len(file_bytes),
   "content_type": content_type,
   "transcription": None, # plug ASR result here
   "notes": "ASR not enabled in MVP. Integrate Whisper or cloud ASR here.",
   }