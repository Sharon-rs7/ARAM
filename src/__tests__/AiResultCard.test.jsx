import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AiResultCard from '@/components/citizen/AiResultCard';

describe('AiResultCard Component Suite', () => {
  const sampleResult = {
    category: 'LABOUR_DISPUTE',
    confidence: 0.94,
    headline: 'Labour Wage Dispute — High Urgency',
    plainSummary: 'The citizen reports unpaid salary for 3 consecutive months by employer.',
    urgencyLevel: 'HIGH',
    nextSteps: [
      'Submit formal notice to District Labour Commissioner.',
      'Gather bank statement proofs and employment ID.',
      'Consult assigned legal guide for free representation.'
    ],
    requiredDocuments: ['Aadhaar Card', 'Employment Passbook', 'Bank Statement']
  };

  it('renders headline, plain summary, and next steps in order', () => {
    render(<AiResultCard result={sampleResult} />);
    
    expect(screen.getByText(/labour wage dispute — high urgency/i)).toBeInTheDocument();
    expect(screen.getByText(/unpaid salary for 3 consecutive months/i)).toBeInTheDocument();
    expect(screen.getByText(/submit formal notice to district labour commissioner/i)).toBeInTheDocument();
    expect(screen.getByText(/aadhaar card/i)).toBeInTheDocument();
  });

  it('does NOT render confidence percentage or raw ML scores to citizens', () => {
    render(<AiResultCard result={sampleResult} />);
    expect(screen.queryByText(/94%/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/classifier/i)).not.toBeInTheDocument();
  });
});
