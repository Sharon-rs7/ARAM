import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SubmitComplaint from '../pages/Citizen/SubmitComplaint';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'usr-1', name: 'Test Citizen', role: 'CITIZEN' },
    isAuthenticated: true,
  }),
}));

describe('SubmitComplaint Guided Wizard Page Suite', () => {
  it('renders Guided Wizard with description input and next step control', () => {
    render(
      <MemoryRouter>
        <SubmitComplaint />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/describe what happened/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next: choose category/i })).toBeInTheDocument();
  });

  it('validates description input and advances to Step 2 on valid input', async () => {
    render(
      <MemoryRouter>
        <SubmitComplaint />
      </MemoryRouter>
    );

    const textarea = screen.getByPlaceholderText(/describe what happened/i);
    fireEvent.change(textarea, { target: { value: 'My company manager has not paid my salary for 3 months.' } });

    const nextBtn = screen.getByRole('button', { name: /next: choose category/i });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText(/labour & salary issue/i)).toBeInTheDocument();
    });
  });
});
