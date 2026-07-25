import DashboardLayout from "@/components/layout/DashboardLayout";
import { Bot, User, Send, Mic, Paperclip, Trash2, Sparkles, Loader2, Info } from "lucide-react";
import { useState } from "react";
import { chatbotService } from "../../services/chatbotService";
import { toast } from "sonner";

const suggestionQuestions = [
  "How can I file a cyber crime complaint?",
  "How do I complain about unpaid salary?",
  "Consumer complaint process for refund",
  "Domestic violence protection helpline",
];

const initialMessages = [
  {
    id: 1,
    sender: "bot",
    text: "Welcome to ARAM AI Legal Assistant. Ask me any legal question or share details about a dispute to get preliminary triage guidance.",
    time: "09:00 AM",
  },
];

const Chatbot = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);

  const sendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: query,
      time: timeString,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await chatbotService.askChatbot({ message: query });
      
      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: res.category,
        suggestedActions: res.suggestedActions,
        confidence: res.confidence
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: "Sorry, I am having trouble connecting to the ARAM AI service right now. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("AI service connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceRecord = () => {
    if (recording) return;
    setRecording(true);
    toast.info("Listening to voice query...");

    setTimeout(() => {
      setRecording(false);
      const text = "How to file consumer complaint for damaged product refund";
      setInput(text);
      toast.success("Voice transcribed successfully!");
    }, 3000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">AI Legal Chatbot</h1>
            <p className="mt-2 text-slate-500">Get instant AI guidance for legal and government complaints.</p>
          </div>

          <button
            onClick={() => setMessages(initialMessages)}
            className="flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 hover:bg-slate-50 transition cursor-pointer text-slate-700 font-semibold"
          >
            <Trash2 size={18} />
            Clear Chat
          </button>
        </div>

        {/* Suggestions */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {suggestionQuestions.map((item) => (
            <button
              key={item}
              onClick={() => sendMessage(item)}
              className="rounded-2xl bg-white p-5 text-left border border-slate-100 shadow-sm transition hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer"
            >
              <Sparkles className="mb-3 text-blue-600 animate-pulse" size={18} />
              <p className="font-semibold text-slate-800 text-sm">{item}</p>
            </button>
          ))}
        </div>

        {/* Chat Box */}
        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-[450px] overflow-y-auto p-8 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex max-w-2xl gap-4 ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${
                      message.sender === "bot" ? "bg-blue-600 text-white" : "bg-slate-100"
                    }`}
                  >
                    {message.sender === "bot" ? <Bot size={20} /> : <User size={20} className="text-slate-600" />}
                  </div>

                  <div className="space-y-2">
                    <div
                      className={`rounded-3xl px-6 py-4 ${
                        message.sender === "bot" ? "bg-slate-50 text-slate-800" : "bg-blue-600 text-white"
                      }`}
                    >
                      <p className="leading-relaxed text-sm">{message.text}</p>
                      
                      {/* Sub-panel details if bot suggests category/actions */}
                      {message.sender === "bot" && message.category && (
                        <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-2">
                          <p>
                            <span className="font-semibold text-slate-700">Classification:</span> {message.category} 
                            {message.confidence && ` (confidence: ${(message.confidence * 100).toFixed(0)}%)`}
                          </p>
                          {message.suggestedActions && message.suggestedActions.length > 0 && (
                            <div>
                              <span className="font-semibold text-slate-700 block mb-1">Suggested Steps:</span>
                              <ul className="list-disc pl-4 space-y-1">
                                {message.suggestedActions.map((action, idx) => (
                                  <li key={idx}>{action}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="mt-2 text-[10px] opacity-70 text-right">{message.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-4 items-center text-slate-400 text-xs">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-55 shadow-inner">
                    <Bot size={20} className="animate-bounce" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Loader2 size={14} className="animate-spin" />
                    ARAM AI is drafting response guidance...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 p-6 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toast.info("Attachments are coming soon.")}
                className="rounded-xl border border-slate-300 p-4 transition hover:bg-white bg-white cursor-pointer"
                title="Attach evidence slip"
              >
                <Paperclip size={20} className="text-slate-600" />
              </button>

              <button
                type="button"
                onClick={handleVoiceRecord}
                className={`rounded-xl border p-4 transition cursor-pointer ${
                  recording ? "bg-red-500 text-white animate-pulse" : "border-slate-300 hover:bg-white bg-white"
                }`}
                title="Dictate message"
              >
                <Mic size={20} className={recording ? "text-white" : "text-slate-600"} />
              </button>

              <input
                type="text"
                placeholder="Ask your legal query..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                className="h-14 flex-1 rounded-xl border border-slate-300 px-5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white text-slate-800"
              />

              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="rounded-xl bg-blue-600 p-4 text-white transition hover:bg-blue-700 cursor-pointer disabled:opacity-50"
              >
                <Send size={22} />
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 leading-relaxed max-w-2xl mx-auto">
              <Info size={14} className="flex-shrink-0" />
              <span>
                <strong>Warning disclaimer:</strong> ARAM provides preliminary complaint guidance only. It does not replace police, court, lawyer, or official authority.
              </span>
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chatbot;
