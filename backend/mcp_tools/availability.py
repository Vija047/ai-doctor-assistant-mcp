import json
from services.calendar_service import CalendarService

def check_availability(doctor_name: str, date: str) -> str:
    """Check available appointment slots for a specific doctor on a given date."""
    slots = CalendarService.check_availability(doctor_name, date)
    return json.dumps({
        "doctor_name": doctor_name,
        "date": date,
        "available_slots": slots,
        "status": "success"
    })
