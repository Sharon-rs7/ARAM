import os
import json
import re
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class GeminiClient:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        self.model_name = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
        self.client = None
        self._initialize_client()

    def _initialize_client(self):
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.client = genai.GenerativeModel(self.model_name)
                print(f"[GEMINI CLIENT] Successfully initialized Gemini model: {self.model_name}")
            except Exception as e:
                print(f"[GEMINI CLIENT ERROR] Failed to initialize Gemini client: {e}")
                self.client = None
        else:
            self.client = None

    def is_configured(self) -> bool:
        return bool(self.api_key and self.client is not None)

    def generate_structured_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        timeout: int = 15
    ) -> Dict[str, Any]:
        """
        Sends generation request to Gemini API and returns validated JSON dict.
        If unconfigured or failed, raises exception for safe fallback routing.
        """
        if not self.is_configured():
            raise RuntimeError("BLOCKED — EXTERNAL DEPENDENCY: GEMINI_API_KEY is not configured in environment.")

        try:
            import google.generativeai as genai
            model = self.client
            
            # Request JSON output
            generation_config = genai.types.GenerationConfig(
                temperature=0.1,
                response_mime_type="application/json"
            )
            
            full_prompt = f"System Instruction: {system_instruction}\n\nUser Request & Context:\n{prompt}" if system_instruction else prompt
            response = model.generate_content(full_prompt, generation_config=generation_config)
            
            raw_text = response.text.strip()
            # Clean possible markdown wrapping ```json ... ```
            if raw_text.startswith("```json"):
                raw_text = re.sub(r"^```json\s*", "", raw_text)
                raw_text = re.sub(r"\s*```$", "", raw_text)
            elif raw_text.startswith("```"):
                raw_text = re.sub(r"^```\s*", "", raw_text)
                raw_text = re.sub(r"\s*```$", "", raw_text)
                
            data = json.loads(raw_text)
            return data
        except Exception as e:
            raise RuntimeError(f"Gemini API generation error: {e}")

gemini_client = GeminiClient()
