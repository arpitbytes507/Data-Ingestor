from PIL import Image, ExifTags
from io import BytesIO

def process_image(file_bytes: bytes, filename: str):
    info = {
    "type": "image",
    "filename": filename,
    "size_bytes": len(file_bytes),
    }
    try:
       img = Image.open(BytesIO(file_bytes))
       info.update({
          "format": img.format,
          "mode": img.mode,
          "width": img.width,
          "height": img.height,
       })
       exif_data = {}
       if hasattr(img, "_getexif") and img._getexif():
         raw = img._getexif() or {}
         for tag, value in raw.items():
           decoded = ExifTags.TAGS.get(tag, tag)
           exif_data[decoded] = value
       if exif_data:
         info["exif"] = exif_data
    except Exception as e:
       info["error"] = f"Image parse failed: {e}"
    return info