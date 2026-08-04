import os
import sys
import io
import wave
import struct
import math
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app

def generate_sine_wave_bytes(duration_sec: float = 2.0, sample_rate: int = 16000) -> bytes:
    num_samples = int(duration_sec * sample_rate)
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        for i in range(num_samples):
            value = int(32767 * 0.3 * math.sin(2 * math.pi * 440 * i / sample_rate))
            wav_file.writeframesraw(struct.pack('<h', value))
    return buf.getvalue()

def test_speech_endpoint_rigorous():
    print("\n==================================================")
    print("FASTER-WHISPER RIGOROUS TRANSCRIBE & NORMALIZATION VERIFICATION")
    print("==================================================")
    
    with TestClient(app) as client:
        # Check /speech/status
        status_resp = client.get("/speech/status")
        print(f"\n1. GET /speech/status Response: {status_resp.status_code} -> {status_resp.json()}")
        assert status_resp.status_code == 200
        assert status_resp.json().get("modelLoaded") is True
        
        # -------------------------------------------------------------
        # TEST CASE 1: REAL SPOKEN WORD AUDIO ("My salary was not paid this month.")
        # -------------------------------------------------------------
        real_wav_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "real_spoken_salary.wav")
        assert os.path.exists(real_wav_path), "real_spoken_salary.wav file not found"
        
        with open(real_wav_path, "rb") as f:
            real_audio_bytes = f.read()
            
        files_spoken = {"file": ("user_salary_complaint.wav", real_audio_bytes, "audio/wav")}
        data_spoken = {"selectedLanguage": "en"}
        
        print("\n2. [TEST CASE 1]: Sending REAL Spoken Audio ('My salary was not paid this month.')...")
        resp_spoken = client.post("/speech/transcribe", files=files_spoken, data=data_spoken)
        
        print(f"   Response Status Code: {resp_spoken.status_code}")
        print(f"   Response JSON Body:\n   {resp_spoken.json()}")
        
        assert resp_spoken.status_code == 200
        res_spoken_json = resp_spoken.json()
        
        transcript_spoken = res_spoken_json.get("transcript", "")
        normalized_spoken = res_spoken_json.get("normalizedText", "")
        
        print(f"\n   [REAL SPOKEN AUDIO VERIFICATION RESULTS]:")
        print(f"   - Transcript: '{transcript_spoken}'")
        print(f"   - Normalized Text: '{normalized_spoken}'")
        print(f"   - Confidence: {res_spoken_json.get('confidence')}")
        
        assert res_spoken_json.get("success") is True
        assert "salary" in transcript_spoken.lower() or "paid" in transcript_spoken.lower() or "month" in transcript_spoken.lower(), f"Failed to transcribe real spoken text! Got '{transcript_spoken}'"
        assert transcript_spoken == normalized_spoken, "Normalized text must match real transcribed audio text"
        assert res_spoken_json.get("confidence", 0.0) > 0.5, "Confidence score for clear speech should be > 0.5"

        # -------------------------------------------------------------
        # TEST CASE 2: SINE WAVE TONE (NO AUDIBLE SPEECH)
        # -------------------------------------------------------------
        sine_audio_bytes = generate_sine_wave_bytes(duration_sec=2.0)
        files_sine = {"file": ("sine_wave_tone.wav", sine_audio_bytes, "audio/wav")}
        data_sine = {"selectedLanguage": "en"}
        
        print("\n3. [TEST CASE 2]: Sending Sine Wave Tone (No Spoken Speech)...")
        resp_sine = client.post("/speech/transcribe", files=files_sine, data=data_sine)
        
        print(f"   Response Status Code: {resp_sine.status_code}")
        print(f"   Response JSON Body:\n   {resp_sine.json()}")
        
        assert resp_sine.status_code == 200
        res_sine_json = resp_sine.json()
        
        transcript_sine = res_sine_json.get("transcript")
        normalized_sine = res_sine_json.get("normalizedText")
        
        print(f"\n   [SINE WAVE / NO SPEECH VERIFICATION RESULTS]:")
        print(f"   - Transcript: '{transcript_sine}'")
        print(f"   - Normalized Text: '{normalized_sine}'")
        print(f"   - Confidence: {res_sine_json.get('confidence')}")
        
        assert res_sine_json.get("success") is True
        assert transcript_sine == "No audible speech detected.", f"Expected 'No audible speech detected.', got '{transcript_sine}'"
        assert normalized_sine == "No audible speech detected.", f"FABRICATED DATA DETECTED! Expected 'No audible speech detected.', got '{normalized_sine}'"
        assert res_sine_json.get("confidence") == 0.0, "Confidence for no speech should be 0.0"

    print("\n==================================================")
    print("BOTH TEST CASES PASSED! DATA FABRICATION ELIMINATED CLEANLY.")
    print("==================================================\n")

if __name__ == "__main__":
    test_speech_endpoint_rigorous()
