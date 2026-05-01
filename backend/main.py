from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from db import Base, engine, get_db
from sqlalchemy.orm import Session
from schemas import ChatRequest, ChatResponse, PatientRegister, PatientLogin, Token
from llm.client import process_chat
from models import Doctor, Patient, Appointment, PatientHistory
from datetime import date, timedelta

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Agentic AI Doctor Appointment System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def seed_data():
    from db import SessionLocal
    db = SessionLocal()
    # Seed default doctors if they do not exist
    if db.query(Doctor).filter(Doctor.name == "Dr. Smith").count() == 0:
        db.add(Doctor(name="Dr. Smith", specialization="General Physician"))
    if db.query(Doctor).filter(Doctor.name == "Dr. Ahuja").count() == 0:
        db.add(Doctor(name="Dr. Ahuja", specialization="Cardiologist"))
    db.commit()
    db.close()

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        reply, tool_used = await process_chat(request.session_id, request.message, request.role, request.username)
        return ChatResponse(
            reply=reply,
            tool_used=tool_used,
            status="success"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/register", response_model=Token, tags=["Auth"])
async def register_patient(patient: PatientRegister, db: Session = Depends(get_db)):
    db_patient = db.query(Patient).filter(Patient.username == patient.username).first()
    if db_patient:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    new_patient = Patient(username=patient.username, email=patient.email, password=patient.password)
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    
    return {"access_token": f"fake-token-{new_patient.id}", "token_type": "bearer", "username": new_patient.username}

@app.post("/login", response_model=Token)
async def login(patient: PatientLogin, db: Session = Depends(get_db)):
    # Allow logging in with either username or email
    db_patient = db.query(Patient).filter(
        (Patient.username == patient.username) | (Patient.email == patient.username)
    ).first()
    
    if not db_patient or db_patient.password != patient.password:
        raise HTTPException(status_code=400, detail="Invalid username or password")
        
    return {"access_token": f"fake-token-{db_patient.id}", "token_type": "bearer", "username": db_patient.username}

@app.get("/api/patients", tags=["Data"])
async def get_patients(db: Session = Depends(get_db)):
    patients = db.query(Patient).all()
    return patients

@app.get("/api/doctors", tags=["Data"])
async def get_doctors(db: Session = Depends(get_db)):
    doctors = db.query(Doctor).all()
    return [{"id": d.id, "name": d.name, "specialization": d.specialization} for d in doctors]

@app.get("/api/appointments", tags=["Data"])
async def get_appointments(db: Session = Depends(get_db)):
    appointments = db.query(Appointment).all()
    return [{
        "id": a.id,
        "patient_name": a.patient_name,
        "date": a.date,
        "time": a.time,
        "status": a.status,
        "doctor_name": a.doctor.name if a.doctor else "Unknown"
    } for a in appointments]

@app.get("/api/appointments/{username}", tags=["Data"])
async def get_patient_appointments(username: str, db: Session = Depends(get_db)):
    appointments = db.query(Appointment).filter(Appointment.patient_name == username).all()
    return [{
        "id": a.id,
        "patient_name": a.patient_name,
        "date": a.date,
        "time": a.time,
        "status": a.status,
        "doctor_name": a.doctor.name if a.doctor else "Unknown"
    } for a in appointments]

@app.get("/api/analytics", tags=["Data"])
async def get_analytics(db: Session = Depends(get_db)):
    today = date.today()
    total_patients_today = db.query(Appointment).filter(Appointment.date == today).count()
    appointments_tomorrow = db.query(Appointment).filter(Appointment.date == today + timedelta(days=1)).count()
    fever_cases = db.query(PatientHistory).filter(PatientHistory.symptoms.ilike("%fever%")).count()
    pending_confirmations = db.query(Appointment).filter(Appointment.status == "pending").count()
    
    weekly_data = [
        {"name": "Mon", "value": 30},
        {"name": "Tue", "value": 45},
        {"name": "Wed", "value": 35},
        {"name": "Thu", "value": 60},
        {"name": "Fri", "value": 20},
    ]
    
    return {
        "metrics": {
            "total_patients_today": total_patients_today,
            "appointments_tomorrow": appointments_tomorrow,
            "fever_cases_this_week": fever_cases,
            "pending_confirmations": pending_confirmations
        },
        "weekly_data": weekly_data
    }

@app.post("/api/trigger-report", tags=["Data"])
async def trigger_report():
    from mcp_tools.report import get_doctor_report
    from services.notification_service import NotificationService
    import json
    
    # Generate the report from the DB
    report_json = get_doctor_report("general_stats")
    report_data = json.loads(report_json)
    
    message = (
        "📊 *Daily Summary Report*\n"
        f"Total Appointments: {report_data.get('report', {}).get('total_appointments', 0)}\n"
        f"Total Patient Histories: {report_data.get('report', {}).get('total_histories', 0)}\n"
    )
    
    # Send via Slack (Mock)
    NotificationService.send_slack_notification("#doctor-updates", message)
    
    return {"status": "success", "message": "Report sent to Slack (#doctor-updates)"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
