import api from './api.js';

export const aiService = {
  analyzeComplaint: (complaintText, language = 'en', district = 'Coimbatore', isSensitive = false, title = '', preferredHelperGender = 'ANY', existingComplaints = []) => {
    return api.post('/ai/analyze-complaint', { complaintText, language, district, isSensitive, title, preferredHelperGender, existingComplaints })
      .then((res) => res.data);
  },

  askChat: (message, language = 'en', userRole = 'CITIZEN', complaintId = null) => {
    return api.post('/chat/ask', { message, language, userRole, complaintId })
      .then((res) => res.data);
  },

  runOcr: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/ai/documents/ocr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data);
  },

  verifyDocument: (file, expectedType, category) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('expectedDocumentType', expectedType);
    formData.append('complaintCategory', category);
    return api.post('/ai/documents/verify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data);
  },
};
