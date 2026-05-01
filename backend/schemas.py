from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    session_id: str
    message: str
    role: Optional[str] = "patient"
    username: Optional[str] = "guest"

class ChatResponse(BaseModel):
    reply: str
    tool_used: Optional[str] = None
    status: str = "success"

class DoctorSchema(BaseModel):
    name: str
    specialization: str
    
    class Config:
        from_attributes = True

class PatientRegister(BaseModel):
    username: str
    email: str
    password: str

class PatientLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: Optional[str] = None
