# ARAM AI — Document OCR & Evidence Verification
**Location**: `docs/ai/DOCUMENT_VERIFICATION.md`

## 1. Document Flow
1. File Upload (.pdf, .png, .jpg, .webp).
2. Quality Analysis (Laplacian blur and contrast scoring).
3. EasyOCR Text Extraction with PII Masking (masking Aadhaar, PAN, passwords).
4. Document Type Classification (Patta/Chitta, Sale Deed, Rental Agreement, EC, ID Proof, Bill).
5. Evidence Relevance Scoring against Complaint Category.
6. Missing Evidence Checklist generation.
