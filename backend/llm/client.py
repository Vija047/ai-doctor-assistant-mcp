import json
from typing import Tuple
from openai import AsyncOpenAI
from datetime import datetime
from config import settings
from memory.session_memory import session_memory
from mcp_tools.availability import check_availability
from mcp_tools.booking import book_appointment
from mcp_tools.report import get_doctor_report
from mcp_tools.email import send_email

# Initialize the OpenAI-compatible client for NVIDIA
client = AsyncOpenAI(
    api_key=settings.NVIDIA_API_KEY,
    base_url=settings.NVIDIA_API_BASE
)

SYSTEM_PROMPT = """You are an AI medical assistant.
You must decide when to call tools.
Always:
* Check availability before booking
* Book appointment only if slot exists
* Send email after booking
* For doctor queries, call report tool
* Maintain conversation context"""

# Tool schemas registered for the LLM
tools = [
    {
        "type": "function",
        "function": {
            "name": "check_availability",
            "description": "Check available appointment slots for a specific doctor on a given date.",
            "parameters": {
                "type": "object",
                "properties": {
                    "doctor_name": {"type": "string", "description": "The name of the doctor."},
                    "date": {"type": "string", "description": "The date to check in YYYY-MM-DD format."}
                },
                "required": ["doctor_name", "date"],
                "additionalProperties": False
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "book_appointment",
            "description": "Book an appointment for a patient with a doctor at a specific date and time.",
            "parameters": {
                "type": "object",
                "properties": {
                    "doctor_name": {"type": "string", "description": "The name of the doctor."},
                    "patient_name": {"type": "string", "description": "The name of the patient."},
                    "date": {"type": "string", "description": "The date of the appointment in YYYY-MM-DD format."},
                    "time": {"type": "string", "description": "The time of the appointment in HH:MM format."}
                },
                "required": ["doctor_name", "patient_name", "date", "time"],
                "additionalProperties": False
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_doctor_report",
            "description": "Get statistics and reports. query_type can be 'patients_count', 'fever_count', 'general_stats', or 'appointments_by_date'.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query_type": {"type": "string", "description": "Type of report to fetch."},
                    "date_str": {"type": "string", "description": "Date in YYYY-MM-DD format. Required if query_type is 'appointments_by_date'."}
                },
                "required": ["query_type"],
                "additionalProperties": False
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "send_email",
            "description": "Send an email confirmation to the patient.",
            "parameters": {
                "type": "object",
                "properties": {
                    "to": {"type": "string", "description": "Email address of the patient."},
                    "message": {"type": "string", "description": "The content of the email."}
                },
                "required": ["to", "message"],
                "additionalProperties": False
            }
        }
    }
]

# Map names to actual callable Python functions
available_functions = {
    "check_availability": check_availability,
    "book_appointment": book_appointment,
    "get_doctor_report": get_doctor_report,
    "send_email": send_email,
}

async def process_chat(session_id: str, user_message: str, user_role: str = "patient", user_name: str = "guest") -> Tuple[str, str]:
    # Initialize session with system prompt if it's new
    history = session_memory.get_history(session_id)
    if not history:
        current_date = datetime.now().strftime("%A, %Y-%m-%d")
        role_specific_prompt = SYSTEM_PROMPT + f"\n\nCurrent date is: {current_date}\n"
        role_specific_prompt += f"You are talking to: {user_name} (Role: {user_role})\n\n"
        
        if user_role == "doctor":
            role_specific_prompt += "You are currently assisting a DOCTOR. Focus on providing reports, patient statistics, and scheduling overviews. Be concise and professional."
        else:
            role_specific_prompt += f"You are currently assisting the PATIENT '{user_name}'.\n"
            role_specific_prompt += "Booking Flow:\n"
            role_specific_prompt += "1. MUST check availability first using 'check_availability'.\n"
            role_specific_prompt += f"2. Book the appointment for '{user_name}' using 'book_appointment' only if the slot is free.\n"
            role_specific_prompt += "3. The 'book_appointment' tool automatically sends an email and adds it to Google Calendar, so you don't need to call 'send_email' separately for the same booking."
        
        role_specific_prompt += "\nIMPORTANT: Always keep your responses short, direct, and concise."
        session_memory.add_message(session_id, "system", role_specific_prompt)
    
    # Add the incoming user message
    session_memory.add_message(session_id, "user", user_message)
    
    tool_used_name = None

    while True:
        messages = session_memory.get_history(session_id)
        
        # Call LLM with the registered tools
        response = await client.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=messages,
            tools=tools,
            tool_choice="auto"
        )
        
        
        response_message = response.choices[0].message
        
        # Check if the LLM wants to call a tool
        if response_message.tool_calls:
            # Need to store the assistant message with tool calls in history
            assistant_msg = {
                "role": "assistant",
                "content": response_message.content,
                "tool_calls": [
                    {
                        "id": t.id,
                        "type": "function",
                        "function": {
                            "name": t.function.name,
                            "arguments": t.function.arguments
                        }
                    } for t in response_message.tool_calls
                ]
            }
            session_memory.sessions[session_id].append(assistant_msg)
            
            # Execute all requested tools
            for tool_call in response_message.tool_calls:
                function_name = tool_call.function.name
                tool_used_name = function_name
                function_to_call = available_functions.get(function_name)
                
                try:
                    function_args = json.loads(tool_call.function.arguments)
                    if function_to_call:
                        function_response = function_to_call(**function_args)
                    else:
                        function_response = json.dumps({"error": f"Function {function_name} not found"})
                except Exception as e:
                    function_response = json.dumps({"error": str(e)})
                
                # Send the tool execution result back to memory
                session_memory.add_message(
                    session_id=session_id,
                    role="tool",
                    content=function_response,
                    tool_call_id=tool_call.id,
                    name=function_name
                )
            
            # After executing all tools, the loop continues to get the final response from LLM
            continue
        
        # If no tool calls, this is the final text response
        final_reply = response_message.content or "I'm sorry, I encountered an issue generating a response."
        session_memory.add_message(session_id, "assistant", final_reply)
        return final_reply, tool_used_name
