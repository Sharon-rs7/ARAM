import { describe, it, expect, vi, beforeEach } from 'vitest';
import { complaintService } from '@/services/complaintService';

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: { id: 'cmp-101', status: 'PENDING', title: 'Unpaid Wages' } })),
    get: vi.fn(() => Promise.resolve({ data: [] }))
  },
  USE_MOCKS: true
}));

describe('ComplaintService REST Client Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('submits complaint payload cleanly', async () => {
    const payload = {
      title: 'Unpaid Wages',
      description: 'Employer has not paid salary for 3 months.',
      district: 'Chennai',
      category: 'LABOUR_DISPUTE',
      priority: 'HIGH'
    };

    const res = await complaintService.submitComplaint(payload);
    expect(res).toBeDefined();
    expect(res.id).toMatch(/^cmp-/);
    expect(res.title).toBe('Unpaid Wages');
    expect(res.status).toBe('PENDING');
  });

  it('checks duplicate similarity score', async () => {
    const res = await complaintService.checkSimilarity({ title: 'Unpaid Wages' });
    expect(res).toBeDefined();
    expect(res.similarityScore).toBe(0.0);
    expect(res.similarComplaintFound).toBe(false);
  });
});
