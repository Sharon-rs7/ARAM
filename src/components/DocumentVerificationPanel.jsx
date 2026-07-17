import { useState } from 'react';
import { aiService } from '../services/aiService.js';
import { Upload, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const EXPECTED_TYPES = [
  "SALARY_SLIP", "INVOICE", "EMPLOYEE_ID", "BANK_STATEMENT", 
  "TRANSACTION_SCREENSHOT", "PROPERTY_DOCUMENT", "MEDICAL_REPORT", 
  "POLICE_COMPLAINT_COPY"
];

const COMPLAINT_CATEGORIES = [
  "LABOUR_DISPUTE", "CONSUMER_COMPLAINT", "CYBER_CRIME", "PROPERTY_DISPUTE", 
  "WOMEN_SAFETY", "DOMESTIC_VIOLENCE", "CRIMINAL_COMPLAINT", "GENERAL_LEGAL_AID"
];

export default function DocumentVerificationPanel() {
  const [file, setFile] = useState(null);
  const [expectedType, setExpectedType] = useState("SALARY_SLIP");
  const [category, setCategory] = useState("LABOUR_DISPUTE");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleVerify(e) {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await aiService.verifyDocument(file, expectedType, category);
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to verify document. Please check if the AI service is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel-card" style={{ padding: 24, borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
      <h2>AI Document OCR & Verification 📄</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Upload your legal documents for OCR text extraction and automated consistency checks.</p>

      <form onSubmit={handleVerify} style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr', marginBottom: 24 }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Select Document Image/PDF</label>
          <div style={{
            border: '2px dashed var(--border-color)',
            borderRadius: 12,
            padding: '24px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            position: 'relative',
            background: 'var(--bg-hover)'
          }}>
            <input 
              type="file" 
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
            <Upload size={32} style={{ color: 'var(--primary)', marginBottom: 8 }} />
            <p style={{ margin: 0, fontWeight: 500 }}>{file ? file.name : "Click or Drag file to upload"}</p>
            <small style={{ color: 'var(--text-muted)' }}>Max file size 2MB (JPG, PNG, WEBP, PDF)</small>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Expected Document Type</label>
          <select value={expectedType} onChange={(e) => setExpectedType(e.target.value)} required>
            {EXPECTED_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Complaint Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            {COMPLAINT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <button 
          className="btn btn-primary" 
          type="submit" 
          disabled={loading}
          style={{ gridColumn: 'span 2', marginTop: 8 }}
        >
          {loading ? "Extracting Text & Verifying..." : "Run AI Document Verification"}
        </button>
      </form>

      {error && <p style={{ color: '#ef4444', fontWeight: 500 }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'var(--bg-hover)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Verification Result</h3>
            <span className={`status-badge ${
              result.status === 'VERIFIED' ? 'success' : 
              result.status === 'NEEDS_MANUAL_REVIEW' ? 'warning' : 'danger'
            }`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 12 }}>
              {result.status === 'VERIFIED' && <CheckCircle size={14} />}
              {result.status === 'NEEDS_MANUAL_REVIEW' && <AlertCircle size={14} />}
              {result.status === 'REJECTED' && <XCircle size={14} />}
              {result.status}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, textAlign: 'center' }}>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Predicted Type</small>
              <b>{result.documentType}</b>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, textAlign: 'center' }}>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>CNN Conf.</small>
              <b>{Math.round(result.cnnConfidence * 100)}%</b>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, textAlign: 'center' }}>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Final Match Score</small>
              <b>{result.finalScore} / 1.0</b>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Extracted Text (Masked Sensitive Data) <FileText size={14} /></label>
            <div style={{
              background: 'var(--bg-card)',
              padding: 12,
              borderRadius: 8,
              fontFamily: 'monospace',
              fontSize: 12,
              maxHeight: 120,
              overflowY: 'auto',
              border: '1px solid var(--border-color)',
              whiteSpace: 'pre-wrap'
            }}>
              {result.ocrTextMasked}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#10b981', marginBottom: 6 }}>Matched Keywords ({result.matchedKeywords.length})</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.matchedKeywords.map((kw, i) => (
                  <span key={i} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#ecfdf5', color: '#047857' }}>{kw}</span>
                ))}
                {result.matchedKeywords.length === 0 && <small style={{ color: 'var(--text-muted)' }}>None</small>}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#ef4444', marginBottom: 6 }}>Missing Keywords ({result.missingKeywords.length})</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.missingKeywords.map((kw, i) => (
                  <span key={i} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#fef2f2', color: '#b91c1c' }}>{kw}</span>
                ))}
                {result.missingKeywords.length === 0 && <small style={{ color: 'var(--text-muted)' }}>None</small>}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
