from typing import List, Dict, Any

class SessionMemory:
    def __init__(self):
        self.sessions: Dict[str, List[Dict[str, Any]]] = {}
        
    def add_message(self, session_id: str, role: str, content: str, tool_call_id: str = None, name: str = None):
        if session_id not in self.sessions:
            self.sessions[session_id] = []
        
        msg = {"role": role, "content": content}
        if tool_call_id:
            msg["tool_call_id"] = tool_call_id
        if name:
            msg["name"] = name
            
        self.sessions[session_id].append(msg)
        
    def get_history(self, session_id: str) -> List[Dict[str, Any]]:
        return self.sessions.get(session_id, [])
        
    def clear_session(self, session_id: str):
        if session_id in self.sessions:
            del self.sessions[session_id]

session_memory = SessionMemory()
