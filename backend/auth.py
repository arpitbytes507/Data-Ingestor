# auth.py
import os
import jwt
from fastapi import Depends, HTTPException, Header
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
if not JWT_SECRET:
    print("❌ No JWT secret loaded. Check your .env file and path.")

def verify_token(authorization: str = Header(...)):
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid auth scheme")
        # ✅ Decode using Supabase JWT secret
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"],audience="authenticated")
        return payload
    except Exception as e:
        print("JWT verification error:", e)
        raise HTTPException(status_code=401, detail="Unauthorized")
    print("JWT_SECRET loaded:", type(JWT_SECRET), JWT_SECRET[:10] if JWT_SECRET else None)

