from faster_whisper import WhisperModel
print("import ok", flush=True)
m = WhisperModel("tiny", device="cpu", compute_type="int8")
print("loaded ok", flush=True)
