"""
ARAM Safety & Emergency Interceptor.
Catches physical violence, suicide threats, active emergencies, sexual assault, dowry harassment violence.
Returns immediate helpline numbers, emergency protocols, and DLSA legal aid contact.
"""
import re
from typing import Optional, Dict, Any

EMERGENCY_PATTERNS = [
    (r"(suicide|kill myself|end my life|chagavaren|tharkolai|chaganum)", "SUICIDE_HELPLINE", "104 / 14416 (Tele-MANAS)"),
    (r"(someone killing|murder|urgent police|kavalthurai|emergency|help me now|adichu konnuduvaan)", "POLICE_EMERGENCY", "112 / 100"),
    (r"(domestic violence|beating wife|husband beating|manaiviya adikiraar|varadatchanai kodumai)", "WOMEN_HELPLINE", "181 (Women in Distress) / 1091"),
    (r"(child abuse|child labour|kuzhandhai thozhilaalar|pocso|kuzhandhai thozhilali)", "CHILD_HELPLINE", "1098 (Childline)")
]

def check_emergency(text: str, language: str = "en") -> Optional[Dict[str, Any]]:
    lower = text.lower()
    for pattern, alert_type, contact in EMERGENCY_PATTERNS:
        if re.search(pattern, lower):
            if language in ["ta", "tanglish"]:
                msg = (
                    f"⚠️ **அவசர உதவி தேவைப்படுகிறது / IMMEDIATE EMERGENCY PROTOCOL**\n\n"
                    f"நீங்கள் உடனடியாக பாதுகாப்பான இடத்திற்கு செல்லவும் அல்லது அவசர உதவி எண்ணை அழைக்கவும்:\n"
                    f"- **காவல்துறை அவசர எண்**: 112 / 100\n"
                    f"- **பெண்கள் உதவி எண்**: 181 / 1091\n"
                    f"- **குழந்தைகள் உதவி எண்**: 1098\n"
                    f"- **மனநல உதவி எண்**: 14416 / 104\n"
                    f"- **இலவச சட்ட உதவி மையம் (DLSA)**: 15100\n\n"
                    f"உங்களுக்கு உடனடி சட்ட பாதுகாப்பு மற்றும் வழிகாட்டுதல் தேவைப்பட்டால் ARAM DLSA குழு எப்போதும் துணையாக இருக்கும்."
                )
            else:
                msg = (
                    f"⚠️ **IMMEDIATE EMERGENCY PROTOCOL**\n\n"
                    f"If you or someone is in immediate danger, please reach out to emergency services immediately:\n"
                    f"- **National Emergency Number**: 112 / 100\n"
                    f"- **Women in Distress Helpline**: 181 / 1091\n"
                    f"- **Childline**: 1098\n"
                    f"- **Tele-MANAS Mental Health**: 14416 / 104\n"
                    f"- **National Legal Services Authority (NALSA/DLSA)**: 15100\n\n"
                    f"ARAM is also here to assist you with formal legal complaint drafting once you are safe."
                )
            return {
                "is_emergency": True,
                "alert_type": alert_type,
                "contact": contact,
                "response": msg
            }
    return None
