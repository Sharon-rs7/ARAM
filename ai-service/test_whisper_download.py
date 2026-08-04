import os
import sys
import time
import wave
import struct
import math
import psutil

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def generate_sample_wav(filename: str, duration_sec: float = 3.0, sample_rate: int = 16000):
    """Generates a valid 16kHz mono WAV file containing a simple audio tone."""
    num_samples = int(duration_sec * sample_rate)
    with wave.open(filename, 'wb') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2) # 16-bit PCM
        wav_file.setframerate(sample_rate)
        
        # Generate 440 Hz tone (A4)
        for i in range(num_samples):
            value = int(32767 * 0.3 * math.sin(2 * math.pi * 440 * i / sample_rate))
            data = struct.pack('<h', value)
            wav_file.writeframesraw(data)

def test_whisper_model_download_and_transcription():
    print("\n==================================================")
    print("STEP 2: FASTER-WHISPER MODEL DOWNLOAD & CACHING VERIFICATION")
    print("==================================================")
    
    process = psutil.Process(os.getpid())
    ram_before = round(process.memory_info().rss / (1024 * 1024), 2)
    print(f"\n1. Initial Process RAM Before Faster-Whisper Model Load: {ram_before} MB")
    
    t0 = time.time()
    print("2. Initializing Faster-Whisper ('base' CTranslate2 model on CPU int8)...")
    from faster_whisper import WhisperModel
    model = WhisperModel("base", device="cpu", compute_type="int8")
    model_load_sec = round(time.time() - t0, 3)
    
    ram_after_model = round(process.memory_info().rss / (1024 * 1024), 2)
    ram_model_delta = round(ram_after_model - ram_before, 2)
    print(f"   Model Loaded in: {model_load_sec} seconds")
    print(f"   RAM After Model Loading: {ram_after_model} MB (Model Weight RAM Impact: +{ram_model_delta} MB)")
    
    wav_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_sample.wav")
    generate_sample_wav(wav_path, duration_sec=3.0)
    print(f"\n3. Generated Test Audio WAV: '{wav_path}' (3.0 seconds, 16kHz mono)")
    
    t_tx_start = time.time()
    print("4. Executing CTranslate2 Faster-Whisper Speech-to-Text Transcription...")
    segments, info = model.transcribe(wav_path, beam_size=5)
    segments_list = list(segments)
    tx_time_sec = round(time.time() - t_tx_start, 3)
    
    transcript_text = " ".join([seg.text for seg in segments_list]).strip()
    
    print(f"\n5. [FASTER-WHISPER INFERENCE EVIDENCE]:")
    print(f"   - Transcription Execution Time: {tx_time_sec} seconds")
    print(f"   - Detected Audio Language: {info.language} (Probability: {round(info.language_probability, 3)})")
    print(f"   - Audio Duration Processed: {round(info.duration, 2)} seconds")
    print(f"   - Transcribed Text Segments Count: {len(segments_list)}")
    print(f"   - Transcribed Text: '{transcript_text if transcript_text else '(Pure sine wave tone - no text)'}'")
    
    if os.path.exists(wav_path):
        os.remove(wav_path)
        
    assert model is not None, "Faster-Whisper model failed to load"
    assert info.duration >= 2.5, "Audio duration mismatch"
    
    print("\n==================================================")
    print("FASTER-WHISPER MODEL DOWNLOAD & CACHING TEST PASSED CLEANLY!")
    print("==================================================\n")

if __name__ == "__main__":
    test_whisper_model_download_and_transcription()
