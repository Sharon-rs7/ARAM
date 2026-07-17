import { AlertTriangle, ShieldCheck, CheckSquare, ListOrdered, Building } from 'lucide-react';

export default function AiResultCard({ result }) {
  if (!result) return null;

  const getPriorityColor = (p) => {
    switch (p?.toUpperCase()) {
      case 'CRITICAL': return { bg: '#fef2f2', text: '#b91c1c', border: '#fee2e2' };
      case 'HIGH': return { bg: '#fff7ed', text: '#c2410c', border: '#ffedd5' };
      case 'MEDIUM': return { bg: '#eff6ff', text: '#1d4ed8', border: '#dbeafe' };
      default: return { bg: '#f8fafc', text: '#475569', border: '#f1f5f9' };
    }
  };

  const pColor = getPriorityColor(result.priority);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 16,
      padding: 24,
      boxShadow: '0 10px 30px rgba(15,23,42,.03)',
      margin: '20px 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid var(--border-color)', paddingBottom: 16, marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>AI Assessment Report</h2>
          <small style={{ color: 'var(--text-muted)' }}>
            {result.modelBased ? "✓ Trained Classification Model" : "⚠️ Fallback Heuristic Match"}
          </small>
        </div>
        
        {result.manualReviewRequired && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#fff7ed',
            color: '#c2410c',
            border: '1px solid #ffedd5',
            padding: '4px 12px',
            borderRadius: 8,
            fontSize: '12px',
            fontWeight: 500
          }}>
            <AlertTriangle size={14} /> Needs Human Review
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Category */}
        <div style={{ padding: 16, background: 'var(--bg-hover)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
          <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Predicted Category</small>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
              {result.category?.replace(/_/g, ' ')}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
              {Math.round(result.confidence * 100)}% Match
            </span>
          </div>
        </div>

        {/* Priority */}
        <div style={{ 
          padding: 16, 
          background: pColor.bg, 
          color: pColor.text, 
          borderRadius: 12, 
          border: `1px solid ${pColor.border}` 
        }}>
          <small style={{ opacity: 0.8, display: 'block', marginBottom: 4 }}>Assessed Priority</small>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
            <span style={{ fontWeight: 700 }}>{result.priority}</span>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Score: {result.priorityScore}</span>
          </div>
        </div>

        {/* Authority */}
        <div style={{ padding: 16, background: 'var(--bg-hover)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
          <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Recommended Authority</small>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Building size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontWeight: 700 }}>{result.recommendedAuthority}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24, flexWrap: 'wrap' }}>
        {/* Required Documents */}
        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 12px 0', fontSize: 14, fontWeight: 600 }}>
            <CheckSquare size={16} style={{ color: 'var(--primary)' }} />
            Required Document Checklist
          </h4>
          <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {result.requiredDocuments?.map((doc, idx) => (
              <li key={idx} style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{doc}</li>
            ))}
            {(!result.requiredDocuments || result.requiredDocuments.length === 0) && (
              <li style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Aadhaar Card</li>
            )}
          </ul>
        </div>

        {/* Next Steps */}
        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 12px 0', fontSize: 14, fontWeight: 600 }}>
            <ListOrdered size={16} style={{ color: 'var(--primary)' }} />
            Recommended Next Steps
          </h4>
          <ol style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {result.nextSteps?.map((step, idx) => (
              <li key={idx} style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{step}</li>
            ))}
          </ol>
        </div>
      </div>

      <div style={{ 
        marginTop: 24, 
        padding: '12px 16px', 
        borderRadius: 8, 
        background: 'var(--bg-hover)', 
        borderLeft: '4px solid var(--primary)', 
        fontSize: '11px', 
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <ShieldCheck size={16} style={{ flexShrink: 0 }} />
        <span>
          <b>Legal Aid Disclaimer:</b> This report is generated by a machine learning model for triage assistance. It is preliminary guidance only and does not constitute a final legal opinion or replace professional counsel.
        </span>
      </div>
    </div>
  );
}
