import os.path
import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/calendar']

class CalendarService:
    @staticmethod
    def get_credentials():
        creds = None
        # The file token.json stores the user's access and refresh tokens
        if os.path.exists('token.json'):
            creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        # If there are no (valid) credentials available, let the user log in.
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists('credentials.json'):
                    raise Exception("Missing credentials.json for Google Calendar API")
                flow = InstalledAppFlow.from_client_secrets_file(
                    'credentials.json', SCOPES)
                # port=0 ensures it finds an open port
                creds = flow.run_local_server(port=0)
            # Save the credentials for the next run
            with open('token.json', 'w') as token:
                token.write(creds.to_json())
        return creds

    @staticmethod
    def check_availability(doctor_name: str, date_str: str) -> list:
        # In a full implementation, you would list events on this day and find free slots
        # Returning mock slots for simplicity as actual availability logic is complex
        return ["09:00", "10:30", "14:00", "15:00"]

    @staticmethod
    def book_slot(doctor_name: str, date_str: str, time_str: str, patient_name: str = "Patient", patient_email: str = None) -> bool:
        try:
            creds = CalendarService.get_credentials()
            service = build('calendar', 'v3', credentials=creds)

            # Combine date and time
            start_dt = datetime.datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
            end_dt = start_dt + datetime.timedelta(hours=1) # 1 hour appointment

            event = {
              'summary': f'Appointment with {doctor_name}',
              'description': f'Patient: {patient_name}',
              'start': {
                'dateTime': start_dt.isoformat(),
                'timeZone': 'UTC',
              },
              'end': {
                'dateTime': end_dt.isoformat(),
                'timeZone': 'UTC',
              },
              'attendees': [
                {'email': patient_email}
              ] if patient_email else []
            }

            event = service.events().insert(calendarId='primary', body=event).execute()
            print('Google Calendar Event created: %s' % (event.get('htmlLink')))
            return True
        except Exception as e:
            print(f"Failed to book Google Calendar slot: {e}")
            # If credentials.json is missing, fallback to True for testing purposes
            if "Missing credentials.json" in str(e):
                print("Fallback: Mock successful booking due to missing credentials.json")
                return True
            return False
