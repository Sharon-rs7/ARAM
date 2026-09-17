import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SubmitComplaint from '@/pages/citizen/SubmitComplaint';

// Mock AuthContext
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'usr-1', name: 'Test Citizen', role: 'CITIZEN' },
    isAuthenticated: true,
  }),
}));

// Mock services
vi.mock('@/services/offlineDraftService', () => ({
  offlineDraftService: {
    getDraft: vi.fn().mockResolvedValue(null),
    saveDraft: vi.fn().mockResolvedValue(null),
    clearDraft: vi.fn().mockResolvedValue(null)
  }
}));

vi.mock('@/services/aiService', () => ({
  aiService: {
    analyzeComplaint: vi.fn().mockResolvedValue({
      category: 'LABOUR_DISPUTE',
      priority: 'MEDIUM',
      detectedLanguage: 'English',
      headline: 'Labour & Salary Issue',
      plainSummary: 'My landlord in Coimbatore...',
      requiredDocuments: [],
      recommendedDocuments: [],
      optionalDocuments: []
    })
  }
}));

vi.mock('@/services/complaintService', () => ({
  complaintService: {
    submitComplaint: vi.fn().mockResolvedValue({ id: 'CMP-123' })
  }
}));

vi.mock('@/services/documentService', () => ({
  documentService: {
    uploadFile: vi.fn().mockResolvedValue({ id: 'doc-123' })
  }
}));

vi.mock('@/services/speechService', () => ({
  speechService: {
    transcribeAudio: vi.fn().mockResolvedValue({ transcript: '' })
  }
}));

describe('SubmitComplaint Guided Wizard Page Suite', () => {
  it('renders Guided Wizard with description input and next step control', () => {
    render(
      <MemoryRouter>
        <SubmitComplaint />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/refusing to refund my security deposit/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyse with ai/i })).toBeInTheDocument();
  });

  it('validates description input and advances to Step 2 on valid input', async () => {
    render(
      <MemoryRouter>
        <SubmitComplaint />
      </MemoryRouter>
    );

    const textarea = screen.getByPlaceholderText(/refusing to refund my security deposit/i);
    fireEvent.change(textarea, { target: { value: 'My company manager has not paid my salary for 3 months.' } });

    const nextBtn = screen.getByRole('button', { name: /analyse with ai/i });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText(/step 2: ai case understanding/i)).toBeInTheDocument();
    });
  });
});

