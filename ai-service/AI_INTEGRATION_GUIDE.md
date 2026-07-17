# ARAM – AI Integration Guide (Real Tesseract OCR & Whisper STT)

This guide documents the steps to set up the actual pre-trained **Tesseract OCR** and **Whisper Speech-to-Text** models on your local machine.

---

## 🎙️ 1. Whisper Speech-to-Text Setup

We use `faster-whisper` (a highly optimized CTranslate2 version of OpenAI's Whisper model). 

### A. Python Requirements
Install the required packages using pip:
```bash
pip install faster-whisper==1.1.0
```

### B. Auto-Download on First Run
Upon the first API call to `/voice/transcribe` (or when `app/speech_to_text.py` is imported on a machine with internet access), the script will automatically contact Hugging Face to download the **Whisper base model weights** (~140MB).
* **Quantization:** The engine uses `int8` quantization to ensure fast execution on standard CPUs without GPU requirements.

---

## 📷 2. Tesseract OCR (Optical Character Recognition) Setup

Tesseract is a binary application and requires installing both the OCR engine and the specific language training packs.

### A. Windows Installation
1. Download the Tesseract installer from UB Mannheim: [Tesseract Installer for Windows](https://github.com/UB-Mannheim/tesseract/wiki).
2. Run the installer and check the box to download **Tamil** (tam) under **Additional script data** or **Additional language data** when prompting.
3. Add the installation folder (e.g. `C:\Program Files\Tesseract-OCR`) to your system **PATH** environment variables.
4. *Optional:* If Tesseract is not added to the system PATH, you can uncomment line 11 in `ai-service/app/ocr_engine.py` and specify your binary path:
   ```python
   pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
   ```

### B. Linux (Ubuntu/Debian) Installation
Install the engine and English/Tamil packs directly via apt:
```bash
sudo apt update
sudo apt install tesseract-ocr tesseract-ocr-eng tesseract-ocr-tam
```

### C. Python Bindings
Install the wrapper package:
```bash
pip install pytesseract==0.3.10
```

---

## 🧪 3. Verifying the Endpoints

Run the FastAPI backend locally:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Test OCR Upload:
```bash
curl -X POST "http://127.0.0.1:8000/documents/ocr" -F "file=@pay_slip.png"
```

### Test Voice Transcription Upload:
```bash
curl -X POST "http://127.0.0.1:8000/voice/transcribe" -F "file=@complaint_voice.wav"
```
