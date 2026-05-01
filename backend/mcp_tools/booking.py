import json
from datetime import datetime
from db import SessionLocal
from models import Appointment, Doctor, Patient
from services.calendar_service import CalendarService
from services.notification_service import NotificationService

def book_appointment(doctor_name: str, patient_name: str, date: str, time: str) -> str:
    """Book an appointment for a patient with a doctor at a specific date and time."""
    db = SessionLocal()
    try:
        doctor = db.query(Doctor).filter(Doctor.name.ilike(f"%{doctor_name}%")).first()
        if not doctor:
            return json.dumps({"status": "error", "message": f"Doctor {doctor_name} not found. Please try 'Dr. Smith'."})
        
        # Try to find patient email
        patient = db.query(Patient).filter(Patient.username == patient_name).first()
        if not patient:
            patient = db.query(Patient).order_by(Patient.id.desc()).first()
            
        patient_email = patient.email if patient else "test@example.com"

        # Call Calendar API with email so patient gets the invite
        success = CalendarService.book_slot(doctor_name, date, time, patient_name, patient_email)
        if not success:
            return json.dumps({"status": "error", "message": "Failed to book slot with Calendar API"})
            
        date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        time_obj = datetime.strptime(time, "%H:%M").time()
        
        appointment = Appointment(
            doctor_id=doctor.id,
            patient_name=patient_name,
            date=date_obj,
            time=time_obj,
            status="booked"
        )
        db.add(appointment)
        db.commit()
        db.refresh(appointment)
        
        # Send Email Confirmation
        NotificationService.send_email(
            to=patient_email,
            subject=f"Appointment Confirmed: {doctor_name}",
            message=f"Hello {patient_name},\n\nYour appointment with {doctor_name} on {date} at {time} is confirmed.\n\nThank you,\nMediCare Team"
        )
        
        return json.dumps({
            "status": "success",
            "message": f"Appointment booked successfully. Confirmation email sent to {patient_email}.",
            "appointment_id": appointment.id
        })
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})
    finally:
        db.close()
