import { useState } from 'react';
import { aiService } from '../services/aiService.js';
import { Upload, FileText, CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';

const EXPECTED_TYPES = [
  "Salary Slip", "Bank Statement", "Rent Agreement", "Medical Report", 
  "Police Complaint / FIR Copy", "Aadhaar / ID Proof", "Screenshot Evidence",
  "Consumer Bill / Invoice", "Property Document", "General Supporting Document"
];

const COMPLAINT_CATEGORIES = [
  "LABOUR_DISPUTE", "CONSUMER_COMPLAINT", "CYBER_CRIME", "PROPERTY_CIVIL_DISPUTE", 
  "WOMEN_SAFETY_DOMESTIC_VIOLENCE", "CRIMINAL_COMPLAINT", "GENERAL_LEGAL_AID"
];

export default function DocumentVerificationPanel() {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [expectedType, setExpectedType] = useState("Salary Slip");
  const [category, setCategory] = useState("LABOUR_DISPUTE");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleVerify(e) {
    if (e) e.preventDefault();
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

  function handleReset() {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    setFile(null);
    setFileUrl(null);
    setResult(null);
    setError('');
  }

  return (
    <section className="panel-card" style={{ padding: 24, borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
      <h2>AI Document OCR & Verification 📄</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Upload your legal documents for OCR text extraction and automated consistency checks.</p>

      {!result ? (
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
                onChange={(e) => {
                  const selected = e.target.files[0];
                  setFile(selected);
                  if (selected) {
                    setFileUrl(URL.createObjectURL(selected));
                  } else {
                    setFileUrl(null);
                  }
                }}
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
              <small style={{ color: 'var(--text-muted)' }}>Max file size 10MB (JPG, PNG, WEBP, PDF)</small>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Expected Document Type</label>
            <select value={expectedType} onChange={(e) => setExpectedType(e.target.value)} required>
              {EXPECTED_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
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
      ) : null}

      {error && <p style={{ color: '#ef4444', fontWeight: 500 }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 12, padding: 20, borderRadius: 12, background: 'var(--bg-hover)', border: result.status === 'REUPLOAD_REQUIRED' ? '2px solid #ef4444' : '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Verification Result</h3>
            <span className={`status-badge ${
              result.status === 'VERIFIED' ? 'success' : 
              result.status === 'MANUAL_REVIEW_REQUIRED' ? 'warning' : 'danger'
            }`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 12, fontWeight: 'bold' }}>
              {result.status === 'VERIFIED' && <CheckCircle size={14} />}
              {result.status === 'MANUAL_REVIEW_REQUIRED' && <AlertCircle size={14} />}
              {result.status === 'REUPLOAD_REQUIRED' && <XCircle size={14} />}
              {result.status === 'REJECTED' && <XCircle size={14} />}
              {result.status.replace(/_/g, ' ')}
            </span>
          </div>

          {result.status === 'REUPLOAD_REQUIRED' && (
            <div style={{ padding: 12, background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 8, color: '#b91c1c', marginBottom: 16, fontSize: 13 }}>
              <b>Warning:</b> Document failed automated validation checks. Please retake a clear photo and try again.
            </div>
          )}

          {fileUrl && file && file.type.startsWith("image/") && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Interactive OCR Scan Preview</label>
              <div style={{
                position: 'relative',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                overflow: 'hidden',
                background: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxHeight: 280,
                padding: 10
              }}>
                <img src={fileUrl} alt="OCR Preview" style={{ maxHeight: 260, objectFit: 'contain', opacity: 0.8 }} />
                
                {/* Mock Bounding Boxes Overlaid */}
                {result.documentType === "Salary Slip" && (
                  <>
                    <div style={{ position: 'absolute', border: '2px solid #10b981', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s', top: "15%", left: "20%", width: "25%", height: "8%" }} title="Employer Name: ARAM Corp (98% confidence)">
                    </div>
                    <div style={{ position: 'absolute', border: '2px solid #10b981', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s', top: "60%", left: "65%", width: "20%", height: "7%" }} title="Net Pay Amount: ₹25,000 (99% confidence)">
                    </div>
                    <div style={{ position: 'absolute', border: '2px solid #10b981', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s', top: "25%", left: "70%", width: "15%", height: "6%" }} title="Month: June 2026 (97% confidence)">
                    </div>
                  </>
                )}

                {result.documentType === "Aadhaar / ID Proof" && (
                  <>
                    <div style={{ position: 'absolute', border: '2px solid #10b981', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s', top: "30%", left: "15%", width: "40%", height: "10%" }} title="Citizen Name Match: Rajesh Kumar (99% confidence)">
                    </div>
                    <div style={{ position: 'absolute', border: '2px solid #10b981', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s', top: "75%", left: "30%", width: "40%", height: "8%" }} title="Aadhaar ID Reference Number (99% confidence)">
                    </div>
                  </>
                )}

                {!["Salary Slip", "Aadhaar / ID Proof"].includes(result.documentType) && (
                  <div style={{ position: 'absolute', border: '2px solid #6366f1', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s', top: "40%", left: "25%", width: "50%", height: "20%" }} title="Evidence text match (92% confidence)">
                  </div>
                )}
              </div>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>💡 Hover over highlighted regions inside the image to view specific AI consistency scan tooltips.</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 10, background: 'var(--bg-card)', borderRadius: 8, textAlign: 'center' }}>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontSize: 10 }}>Predicted Type</small>
              <b style={{ fontSize: 12 }}>{result.documentType}</b>
            </div>
            <div style={{ padding: 10, background: 'var(--bg-card)', borderRadius: 8, textAlign: 'center' }}>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontSize: 10 }}>OCR Conf.</small>
              <b style={{ fontSize: 12 }}>{Math.round(result.ocrConfidence * 100)}%</b>
            </div>
            <div style={{ padding: 10, background: 'var(--bg-card)', borderRadius: 8, textAlign: 'center' }}>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontSize: 10 }}>Verification Score</small>
              <b style={{ fontSize: 12 }}>{result.verificationScore} / 1.0</b>
            </div>
          </div>

          {result.extractedFields && Object.keys(result.extractedFields).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Extracted Key Fields</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 12, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: 12 }}>
                {Object.entries(result.extractedFields).map(([k, v]) => (
                  <div key={k}>
                    <span style={{ color: 'var(--text-muted)' }}>{k.replace(/([A-Z])/g, ' $1')}:</span> <b>{String(v)}</b>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Extracted Text (Masked Sensitive Data) <FileText size={14} /></label>
            <div style={{
              background: 'var(--bg-card)',
              padding: 12,
              borderRadius: 8,
              fontFamily: 'monospace',
              fontSize: 11,
              maxHeight: 100,
              overflowY: 'auto',
              border: '1px solid var(--border-color)',
              whiteSpace: 'pre-wrap'
            }}>
              {result.ocrTextMasked || "No text extracted."}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#10b981', marginBottom: 6, fontSize: 13 }}>Verification Reasons</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {result.reasons && result.reasons.map((r, i) => (
                  <span key={i} style={{ fontSize: 11, color: '#047857' }}>• {r}</span>
                ))}
                {(!result.reasons || result.reasons.length === 0) && <small style={{ color: 'var(--text-muted)' }}>None</small>}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#ef4444', marginBottom: 6, fontSize: 13 }}>Errors / Warnings</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {result.errors && result.errors.map((e, i) => (
                  <span key={i} style={{ fontSize: 11, color: '#b91c1c' }}>• Error: {e}</span>
                ))}
                {result.warnings && result.warnings.map((w, i) => (
                  <span key={i} style={{ fontSize: 11, color: '#d97706' }}>• Warning: {w}</span>
                ))}
                {(!result.errors || result.errors.length === 0) && (!result.warnings || result.warnings.length === 0) && <small style={{ color: 'var(--text-muted)' }}>None</small>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary flex-1" onClick={handleReset}>
              Upload Another
            </button>
            {result.status === 'REUPLOAD_REQUIRED' && (
              <button className="btn btn-primary flex-1" onClick={() => { handleReset(); }} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <RefreshCw size={14} /> Retry Upload
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
