import os
import re
import json
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
load_dotenv()

from llm.base_provider import BaseLLMProvider
from llm.prompts import STRICT_LEGAL_SYSTEM_PROMPT, STRICT_RETRY_SYSTEM_PROMPT, build_llm_prompt

CANDIDATE_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
    "gemini-3.7-flash",
    "gemini-3.6-flash"
]

class GeminiProvider(BaseLLMProvider):
    """
    Gemini API provider acting as the intelligent legal generator.
    Includes seamless multi-model fallback across candidate models to ensure uninterrupted operation.
    """

    def __init__(self):
        load_dotenv()
        self.api_key = os.environ.get("GEMINI_API_KEY")
        self.model_name = os.environ.get("GEMINI_MODEL", "gemini-3.1-flash-lite")
        if self.model_name in ["gemini-3.5-flash-lite-bad", "gemini-2.5-flash"]:
            self.model_name = "gemini-3.1-flash-lite"
        self.client = None
        self._init_client()

    def _init_client(self):
        load_dotenv()
        if not self.api_key:
            self.api_key = os.environ.get("GEMINI_API_KEY")
        if not self.model_name or self.model_name in ["gemini-3.5-flash-lite-bad", "gemini-2.5-flash"]:
            self.model_name = os.environ.get("GEMINI_MODEL", "gemini-3.1-flash-lite")
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.client = genai.GenerativeModel(self.model_name)
            except Exception as e:
                print(f"[GEMINI PROVIDER INIT ERROR] {e}")
                self.client = None
        else:
            self.client = None

    def is_available(self) -> bool:
        if not self.client or not self.api_key:
            self._init_client()
        return bool(self.api_key and self.client is not None)

    def _generate_with_fallback(self, prompt: str, generation_config: Any) -> str:
        """
        Executes generation with automatic multi-model failover if quota (429) or unavailability occurs.
        """
        import google.generativeai as genai
        models_to_try = [self.model_name] + [m for m in CANDIDATE_MODELS if m != self.model_name]
        last_err = None
        for m in models_to_try:
            try:
                client = genai.GenerativeModel(m)
                resp = client.generate_content(prompt, generation_config=generation_config)
                if resp and resp.text:
                    self.model_name = m
                    self.client = client
                    return resp.text.strip()
            except Exception as e:
                last_err = e
                err_str = str(e)
                if any(k in err_str.lower() for k in ["429", "quota", "resourceexhausted", "not found", "404", "unavailable"]):
                    print(f"[GEMINI ROTATION] Model {m} hit limit ({e}), rotating to next candidate...")
                    continue
                else:
                    raise e
        raise RuntimeError(f"All Gemini candidate models exhausted: {last_err}")

    def health_check(self) -> Dict[str, Any]:
        return {
            "provider": "gemini",
            "model": self.model_name,
            "configured": bool(self.api_key),
            "available": self.is_available(),
            "status": "ready" if self.is_available() else ("unconfigured" if not self.api_key else "init_failed")
        }

    def generate_guidance(
        self,
        query: str,
        retrieved_context: str,
        language: str,
        category_name: str,
        recommended_authority: str,
        required_documents: List[str],
        case_summary: Optional[str] = None,
        is_retry: bool = False
    ) -> Dict[str, Any]:
        """
        Sends generation request to Gemini API and returns validated JSON dict.
        """
        if not self.is_available():
            self._init_client()
            if not self.is_available():
                raise RuntimeError("Gemini API key is not configured or client initialization failed.")

        import google.generativeai as genai

        prompt = build_llm_prompt(
            query=query,
            retrieved_context=retrieved_context,
            language=language,
            category_name=category_name,
            recommended_authority=recommended_authority,
            required_documents=required_documents,
            case_summary=case_summary,
            is_retry=is_retry
        )

        sys_prompt = STRICT_RETRY_SYSTEM_PROMPT if is_retry else STRICT_LEGAL_SYSTEM_PROMPT

        generation_config = genai.types.GenerationConfig(
            temperature=0.1,
            response_mime_type="application/json"
        )

        full_prompt = f"System Instruction: {sys_prompt}\n\nUser Request & Context:\n{prompt}"

        try:
            raw_text = self._generate_with_fallback(full_prompt, generation_config=generation_config)
            
            if raw_text.startswith("```json"):
                raw_text = re.sub(r"^```json\s*", "", raw_text)
                raw_text = re.sub(r"\s*```$", "", raw_text)
            elif raw_text.startswith("```"):
                raw_text = re.sub(r"^```\s*", "", raw_text)
                raw_text = re.sub(r"\s*```$", "", raw_text)

            parsed = json.loads(raw_text)
            return parsed
        except Exception as e:
            raise RuntimeError(f"Gemini API generation error: {e}")

    def generate_conversational_response(
        self,
        user_message: str,
        language: str = "en",
        conversation_history: Optional[List[Dict[str, str]]] = None,
        context_notes: Optional[str] = None
    ) -> str:
        """
        Generates a natural, empathetic, and intelligent conversational response
        as ARAM AI (covering capabilities, supported languages, how the system works,
        advice, or general discussion in Tamil, Tanglish, Hindi, or English).
        """
        if not self.is_available():
            self._init_client()

        if not self.is_available():
            return self._build_conversational_fallback(user_message, language)

        import google.generativeai as genai

        prompt = (
            f"You are ARAM AI (அறம் AI), the verified legal aid assistant for citizens of Tamil Nadu and India.\n"
            f"You speak fluently in Tamil, Tanglish (Tamil written in Latin script), Hindi, and English.\n"
            f"Respond directly and warmly to the citizen in their requested language: {language}.\n\n"
            f"Instructions:\n"
            f"1. If the user asks for help or how you can assist ('can u help me', 'what can you do', 'unaku enna panna mudiyum'): warmly explain that you provide statutory legal guidance under Indian & Tamil Nadu laws, checklist of required documents/evidence, breakdown of complex multi-issue complaints, audio voice note & document OCR analysis, and connect them with District Legal Aid / Regional Admins.\n"
            f"2. If the user asks what languages you support: confirm Tamil, Tanglish, Hindi, and English.\n"
            f"3. Speak directly to the citizen as their legal companion. Do NOT output analysis notes, checklists, or meta-commentary. Output ONLY your direct response to the citizen.\n\n"
        )

        generation_config = genai.types.GenerationConfig(
            temperature=0.7,
            max_output_tokens=600
        )

        history_text = ""
        if conversation_history:
            for turn in conversation_history[-4:]:
                if isinstance(turn, dict):
                    history_text += f"{turn.get('role', 'User')}: {turn.get('content', '')}\n"
                elif isinstance(turn, str):
                    history_text += f"• {turn}\n"

        if history_text:
            prompt += f"Recent Chat History:\n{history_text}\n\n"
        if context_notes:
            prompt += f"Context Notes: {context_notes}\n\n"
        prompt += f"User Message: {user_message}\n\nARAM AI Reply to Citizen:"

        try:
            return self._generate_with_fallback(prompt, generation_config=generation_config)
        except Exception as e:
            print(f"[GEMINI CONVERSATIONAL ERROR] {e}")
            return self._build_conversational_fallback(user_message, language)

    def _build_conversational_fallback(self, user_message: str, language: str) -> str:
        is_tanglish = language == "ta_tanglish" or any(m in user_message.lower() for m in ["panren", "kudukala", "therium", "mudium", "epd", "work aaguthu", "sollunga"])
        is_ta = language.startswith("ta") and not is_tanglish
        is_hi = language.startswith("hi")

        if is_tanglish:
            return (
                "Vanakkam! 🙏 Naan **ARAM AI (அறம் AI)** — ungaloda official legal aid assistant! ⚖️\n\n"
                "Ennala ungalukku indha vishayangal-la help panna mudiyum:\n"
                "1. **Statutory Legal Guidance 📜:** Indian & Tamil Nadu sattangalin padi sariyaana sections & remedies solven.\n"
                "2. **Multi-Issue Decomposition 🧩:** Ungalukku 2 or more problems irundha (e.g., salary pending + Aadhaar misuse), adhai thanithaniyaaga pirithu step-by-step action plan tharuven.\n"
                "3. **Document Evidence Checklist 📋:** Dispute-ku thevaiyaana original proofs & documents list solven.\n"
                "4. **Voice STT & Document OCR 🎙️📄:** Voice notes and uploaded papers-ai direct-ah analyze panna mudiyum.\n"
                "5. **Admin & Guide Routing 🤝:** District Regional Admin & Legal Aid Advocates kitta direct-ah formal grievance submit panna mudiyum.\n\n"
                "🌍 **Supported Languages:** Tamil, Tanglish, Hindi, and English!\n\n"
                "Ungalukku ippo enna legal problem or clarification thevai? Sollunga, naan guide panren! 😊"
            )
        elif is_ta:
            return (
                "வணக்கம்! 🙏 நான் **அறம் (ARAM) AI** — உங்கள் அதிகாரப்பூர்வ சட்ட உதவி உதவியாளர். ⚖️\n\n"
                "நான் உங்களுக்கு எவ்வாறு உதவ முடியும்:\n"
                "1. **சட்ட வழிகாட்டுதல் 📜:** இந்திய மற்றும் தமிழக சட்டங்களின்படி சரியான சட்டப் பிரிவுகள் மற்றும் தீர்வு முறைகள்.\n"
                "2. **பல சிக்கல்கள் பகுப்பாய்வு 🧩:** ஊதிய பாக்கி, நிலத் தகராறு, மோசடி போன்ற பல சிக்கல்களை தனித்தனியாக பிரித்து வழிநடத்துதல்.\n"
                "3. **ஆவண சரிபார்ப்பு பட்டியல் 📋:** புகாருக்கு தேவையான அசல் சான்றுகளின் பட்டியல்.\n"
                "4. **குரல் பதிவு & ஆவண ஸ்கேன் 🎙️📄:** வாய்ஸ் மெசேஜ் மற்றும் ஆவணங்களை நேரடியாக ஆய்வு செய்தல்.\n"
                "5. **வழக்கறிஞர் இணைப்பு 🤝:** மாவட்ட நிர்வாகம் மற்றும் சட்ட வழிகாட்டிகளுடன் உங்கள் மனுவை அதிகாரப்பூர்வமாக இணைத்தல்.\n\n"
                "🌍 **ஆதரிக்கப்படும் மொழிகள்:** தமிழ், தங்கிலீஷ், இந்தி, ஆங்கிலம்.\n\n"
                "உங்கள் பிரச்சனை அல்லது சந்தேகத்தை விவரிக்கவும், உடனடி வழிகாட்டுகிறேன்! 😊"
            )
        elif is_hi:
            return (
                "नमस्ते! 🙏 मैं **अराम (ARAM) AI** हूँ — आपका आधिकारिक कानूनी सहायता सहायक। ⚖️\n\n"
                "मैं आपकी इस प्रकार सहायता कर सकता हूँ:\n"
                "1. **कानूनी मार्गदर्शन 📜:** भारतीय कानूनों के अनुसार सही धाराएं एवं कानूनी प्रक्रियाएं।\n"
                "2. **बहु-मामला विश्लेषण 🧩:** यदि एक से अधिक विवाद हैं तो उन्हें अलग-अलग चरणबद्ध हल करना।\n"
                "3. **दस्तावेज़ सूची 📋:** शिकायत के लिए आवश्यक प्रमाण पत्रों की सूची।\n"
                "4. **वॉइस और दस्तावेज़ स्कैन 🎙️📄:** वॉइस रिकॉर्डिंग और दस्तावेज़ों का त्वरित विश्लेषण।\n"
                "5. **जिला प्रशासन एवं वकील सहायता 🤝:** आपकी शिकायत को सीधे जिला स्तर पर अग्रेषित करना।\n\n"
                "🌍 **समर्थित भाषाएं:** तमिल, तंगलिश, हिंदी, अंग्रेजी।\n\n"
                "अपनी कानूनी समस्या बताएं, मैं आपकी पूरी सहायता करूँगा! 😊"
            )
        else:
            return (
                "Vanakkam! 🙏 I am **ARAM AI** — your conversational legal aid assistant. ⚖️\n\n"
                "Here is how I can assist you:\n"
                "1. **Statutory Legal Guidance 📜:** Providing applicable Indian and Tamil Nadu statutes, sections, and legal procedures.\n"
                "2. **Multi-Issue Decomposition 🧩:** Breaking down complex multi-part disputes into actionable sub-cases.\n"
                "3. **Evidence Checklist 📋:** Listing required supporting deeds, receipts, and records.\n"
                "4. **Voice STT & Document OCR 🎙️📄:** Transcribing voice notes and scanning uploaded documents.\n"
                "5. **Official Redressal Routing 🤝:** Routing complaints directly to District Administrators and verified Legal Aid Advocates.\n\n"
                "🌍 **Supported Languages:** Tamil, Tanglish, Hindi, and English.\n\n"
                "How can I help you today? Please describe your legal grievance or question! 😊"
            )

gemini_provider = GeminiProvider()

