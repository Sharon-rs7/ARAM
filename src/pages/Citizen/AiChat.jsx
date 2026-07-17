import { useState, useRef, useEffect } from 'react';
import ChatMessageBubble from '../../components/ChatMessageBubble.jsx';
import { aiService } from '../../services/aiService.js';
import { Send, Sparkles } from 'lucide-react';

export default function AiChat() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your ARAM Legal Aid assistant. How can I guide you today?\n\nYou can ask me questions about labour disputes, consumer rights, domestic issues, cyber scams, or property claims.",
      disclaimer: "This is preliminary legal aid guidance only, not a final legal opinion.",
      suggestedActions: ["Labour dispute guidance", "Reporting cyber crime", "DLSA services list"]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /*
    if (false) {
      const unused = null;
      // Reserved for future accessibility output.
      const cleanText = text.split('\n')[0].replace(/[*_#`⚠️]/g, '');
      const utterance = cleanText;
      void unused;
      void utterance;
    }
  */

  async function handleSend(textToSend) {
    const query = textToSend || input.trim();
    if (!query) return;

    if (!textToSend) setInput('');
    setError('');

    const userMessage = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await aiService.askChat(query);
      const botMessage = {
        sender: 'bot',
        text: res.reply,
        disclaimer: res.disclaimer,
        suggestedActions: res.suggestedActions
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError(err.message || "Failed to query AI chatbot. Please make sure the AI service is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', padding: '0 8px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 12, marginBottom: 12 }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} className="text-primary" /> ARAM AI Legal Assistant
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Interactive Triage & Preliminary Guidance chat</p>
        </div>

        <span className="status-pill">Text only</span>
      </div>

      {/* Main chat log */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
        border: '1px solid var(--border-color)',
        borderRadius: 16,
        background: 'var(--bg-card)',
        boxShadow: 'inset 0 2px 8px rgba(15,23,42,.02)'
      }}>
        {messages.map((m, idx) => (
          <ChatMessageBubble key={idx} message={m} />
        ))}
        
        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 0', color: 'var(--text-muted)' }}>
            <Sparkles size={16} className="spin" style={{ animation: 'spin 2s linear infinite' }} />
            <small style={{ fontWeight: 500 }}>AI is typing...</small>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: 12, borderRadius: 8, fontSize: 13, marginTop: 12 }}>
            {error}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input container */}
      <div style={{ display: 'flex', gap: 10, padding: '16px 0', alignItems: 'center' }}>
        <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your legal aid query here..." 
            style={{ paddingRight: 45, borderRadius: 12, width: '100%' }}
            disabled={loading}
          />
          <button 
            type="button" 
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            style={{
              position: 'absolute',
              right: 6,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 32,
              height: 32,
              borderRadius: 8,
              border: 'none',
              background: input.trim() ? 'var(--primary)' : 'var(--bg-hover)',
              color: input.trim() ? 'white' : 'var(--text-muted)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer'
            }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
