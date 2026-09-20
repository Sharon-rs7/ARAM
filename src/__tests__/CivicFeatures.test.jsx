import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LanguageProvider } from "@/context/LanguageContext";
import PetitionGeneratorModal from "@/components/citizen/PetitionGeneratorModal";
import Section12EligibilityModal from "@/components/citizen/Section12EligibilityModal";
import ScheduleAppointmentModal from "@/components/citizen/ScheduleAppointmentModal";
import CaseSatisfactionRatingCard from "@/components/citizen/CaseSatisfactionRatingCard";

const mockComplaint = {
  id: 42,
  complaintCustomId: "ARM-2026-000042",
  title: "Encroachment on Ancestral Patta Land",
  category: "Land & Property",
  description: "Neighbor encroached 5 cents of patta land without permission.",
  district: "Salem District",
  location: "Mettur Taluk, Salem",
  userName: "Anbarasan K",
  userMobile: "9876543210"
};

describe("Civic Features & Connected Grievance Suite", () => {
  it("renders PetitionGeneratorModal with correct citizen facts and authority", () => {
    const { getByText, getAllByText } = render(
      <LanguageProvider>
        <PetitionGeneratorModal
          isOpen={true}
          onClose={vi.fn()}
          complaint={mockComplaint}
          user={{ name: "Anbarasan K", mobile: "9876543210" }}
        />
      </LanguageProvider>
    );

    expect(getAllByText(/Anbarasan K/i).length).toBeGreaterThan(0);
    expect(getByText(/Mettur Taluk, Salem/i)).toBeDefined();
    expect(getAllByText(/ARM-2026-000042/i).length).toBeGreaterThan(0);
    expect(getByText(/Print Petition/i)).toBeDefined();
  });

  it("renders Section12EligibilityModal questions accurately", () => {
    const { getByText } = render(
      <LanguageProvider>
        <Section12EligibilityModal
          isOpen={true}
          onClose={vi.fn()}
          district="Salem District"
        />
      </LanguageProvider>
    );

    expect(getByText(/NALSA Section 12 Legal Aid Eligibility/i)).toBeDefined();
    expect(getByText(/Are you a woman or a child/i)).toBeDefined();
    expect(getByText(/Do you belong to Scheduled Caste/i)).toBeDefined();
    expect(getByText(/Check Free Legal Aid Eligibility/i)).toBeDefined();
  });

  it("renders ScheduleAppointmentModal with consultation mode and slots", () => {
    const { getByText } = render(
      <LanguageProvider>
        <ScheduleAppointmentModal
          isOpen={true}
          onClose={vi.fn()}
          complaintId={42}
          guideName="Advocate Selvam"
        />
      </LanguageProvider>
    );

    expect(getByText(/Request 10-Min Guidance Call/i)).toBeDefined();
    expect(getByText(/With Advocate Selvam/i)).toBeDefined();
    expect(getByText(/Phone Call/i)).toBeDefined();
    expect(getByText(/Confirm Call Request/i)).toBeDefined();
  });

  it("renders CaseSatisfactionRatingCard and allows star ratings and feedback", () => {
    const { getByText } = render(
      <LanguageProvider>
        <CaseSatisfactionRatingCard
          complaintId={42}
          existingFeedback={null}
          onFeedbackSubmitted={vi.fn()}
          onOpenAppeal={vi.fn()}
        />
      </LanguageProvider>
    );

    expect(getByText(/Citizen Satisfaction & Resolution Feedback/i)).toBeDefined();
    expect(getByText(/Confirm Resolution & Submit Feedback/i)).toBeDefined();
  });
});
