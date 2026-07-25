import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, RefreshCw, Check, AlertCircle, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";

const VoiceRecorder = ({ onTranscriptReady, currentLanguage = "en-IN" }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [supportWebSpeech, setSupportWebSpeech] = useState(true);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsentAlert, setShowConsentAlert] = useState(true);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupportWebSpeech(false);
    }
  }, []);

  const startRecording = async () => {
    if (!consentGiven) {
      toast.warning("Please review and accept the Voice Privacy Consent first.");
      return;
    }

    setTranscript("");
    audioChunksRef.current = [];

    if (supportWebSpeech) {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = currentLanguage;

        rec.onstart = () => {
          setIsRecording(true);
          toast.info("Microphone active. Speak now...");
        };

        rec.onresult = (event) => {
          const resultText = event.results[0][0].transcript;
          setTranscript(resultText);
          toast.success("Voice converted successfully.");
        };

        rec.onerror = (event) => {
          console.error("Speech recognition error", event);
          toast.error("Speech recognition error: " + event.error);
          setIsRecording(false);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (e) {
        console.error("Failed to start Web Speech recognition", e);
        setSupportWebSpeech(false);
        startMediaRecorder(); // Fallback to MediaRecorder upload
      }
    } else {
      await startMediaRecorder();
    }
  };

  const startMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        toast.loading("Converting speech to text via ARAM AI service...");
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.wav");
          formData.append("language", currentLanguage);

          const res = await api.post("/speech/transcribe", formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });

          if (res.data?.transcript) {
            setTranscript(res.data.transcript);
            toast.dismiss();
            toast.success("Transcription complete!");
          } else {
            throw new Error("Empty transcript returned");
          }
        } catch (e) {
          toast.dismiss();
          toast.error("Audio upload transcription failed. Please try typing instead.");
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Recording audio. Press stop when finished.");
    } catch (err) {
      toast.error("Microphone access denied. Please verify browser permissions.");
    }
  };

  const stopRecording = () => {
    if (supportWebSpeech && recognitionRef.current) {
      recognitionRef.current.stop();
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
  };

  const handleApply = () => {
    if (transcript) {
      onTranscriptReady(transcript);
      toast.success("Transcript loaded into form description!");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      {showConsentAlert && !consentGiven && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-150 flex flex-col gap-2">
          <div className="flex gap-2">
            <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={16} />
            <div className="text-xs text-blue-800 leading-relaxed">
              <p className="font-bold">Voice Privacy & Consent</p>
              <p className="mt-1">ARAM converts your speech to text dynamically. We do not store audio recording data unless you explicitly submit a complaint. Please ensure you are in a quiet, private area when speaking sensitive details.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-1">
            <button
              onClick={() => {
                setConsentGiven(true);
                setShowConsentAlert(false);
              }}
              className="px-3 py-1 rounded bg-blue-600 text-[10px] font-bold text-white uppercase tracking-wider hover:bg-blue-700 transition"
            >
              I Consent
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center py-4 space-y-3">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Voice Complaint Assistant</p>
        
        <div className="relative">
          {isRecording && (
            <span className="absolute inset-0 rounded-full bg-red-150 animate-ping opacity-75"></span>
          )}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`relative z-10 h-16 w-16 rounded-full flex items-center justify-center shadow-lg transition active:scale-95 ${
              isRecording
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-400 mt-1">
            {isRecording ? "Listening... Click to stop." : "Click microphone button to start speaking."}
          </p>
          <p className="text-[10px] text-slate-400 italic mt-1.5 font-medium max-w-[280px] mx-auto">
            Tamil: "Mic press pannitu unga problem-a sollunga. ARAM text-a maathi help pannum."
          </p>
        </div>
      </div>

      {transcript && (
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Generated Transcript Preview</label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full min-h-[70px] rounded-xl border border-slate-200 p-3 text-xs text-slate-700 focus:border-blue-500 outline-none resize-y transition"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setTranscript("");
                toast.info("Transcript cleared.");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-semibold hover:bg-slate-50 transition"
            >
              <RefreshCw size={12} /> Clear
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition"
            >
              <Check size={12} /> Apply Text
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
