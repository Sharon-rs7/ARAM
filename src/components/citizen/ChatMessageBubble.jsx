import { Sparkles, User } from 'lucide-react';

export default function ChatMessageBubble({ message }) {
  const isBot = message.sender === 'bot';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isBot ? 'flex-start' : 'flex-end',
      margin: '12px 0',
      maxWidth: '100%'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        maxWidth: '85%',
        flexDirection: isBot ? 'row' : 'row-reverse'
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 99,
          background: isBot ? 'var(--primary-light, #eff6ff)' : 'var(--bg-hover)',
          color: isBot ? 'var(--primary)' : 'inherit',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          border: '1px solid var(--border-color)'
        }}>
          {isBot ? <Sparkles size={16} /> : <User size={16} />}
        </div>
        
        <div style={{
          background: isBot ? 'var(--bg-card)' : 'var(--primary)',
          color: isBot ? 'inherit' : 'white',
          padding: '12px 16px',
          borderRadius: isBot ? '0px 16px 16px 16px' : '16px 0px 16px 16px',
          boxShadow: '0 4px 16px rgba(15,23,42,.03)',
          border: isBot ? '1px solid var(--border-color)' : 'none',
          lineHeight: '1.5',
          fontSize: '14px',
          whiteSpace: 'pre-wrap'
        }}>
          {message.text}

          {isBot && message.disclaimer && (
            <div style={{ 
              marginTop: 10, 
              paddingTop: 8, 
              borderTop: '1px dashed var(--border-color)', 
              fontSize: '11px', 
              color: 'var(--text-muted)' 
            }}>
              ⚠️ {message.disclaimer}
            </div>
          )}
        </div>
      </div>

      {isBot && message.suggestedActions && message.suggestedActions.length > 0 && (
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 8, 
          marginTop: 8, 
          marginLeft: 42 
        }}>
          {message.suggestedActions.map((action, idx) => (
            <span 
              key={idx} 
              style={{
                background: 'var(--bg-hover)',
                border: '1px solid var(--border-color)',
                fontSize: '12px',
                padding: '4px 12px',
                borderRadius: 99,
                color: 'var(--primary)',
                fontWeight: 500
              }}
            >
              ✓ {action}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
