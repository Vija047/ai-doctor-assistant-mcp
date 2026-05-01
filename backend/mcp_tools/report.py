import json
from db import SessionLocal
from models import Appointment, PatientHistory

from datetime import datetime

def get_doctor_report(query_type: str, date_str: str = None) -> str:
    """Get statistics and reports for doctors. 
    query_type can be 'patients_count', 'fever_count', 'general_stats', or 'appointments_by_date'.
    date_str is required for 'appointments_by_date' in YYYY-MM-DD format.
    """
    db = SessionLocal()
    try:
        if query_type == "patients_count":
            count = db.query(Appointment).count()
            data = {"total_patients": count}
        elif query_type == "fever_count":
            count = db.query(PatientHistory).filter(PatientHistory.symptoms.ilike("%fever%")).count()
            data = {"fever_patients_count": count}
        elif query_type == "appointments_by_date":
            if not date_str:
                return json.dumps({"status": "error", "message": "date_str is required for appointments_by_date"})
            try:
                target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            except ValueError:
                return json.dumps({"status": "error", "message": "Invalid date format. Use YYYY-MM-DD"})
            count = db.query(Appointment).filter(Appointment.date == target_date).count()
            data = {"appointments_count": count, "date": date_str}
        else:
            total_appts = db.query(Appointment).count()
            total_histories = db.query(PatientHistory).count()
            data = {"total_appointments": total_appts, "total_histories": total_histories}
            
        return json.dumps({"status": "success", "report": data, "query_type": query_type})
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})
    finally:
        db.close()
